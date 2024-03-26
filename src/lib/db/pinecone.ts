import { Pinecone, Vector } from "@pinecone-database/pinecone";
import { downloadsFromS3 } from "../s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import {
  RecursiveCharacterTextSplitter,
  Document,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "../embeddings";
import { convertToAscii } from "../utils";

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: {
      pageNumber: number;
    };
  };
};

export async function loadS3IntoPinecone(filekey: string) {
  // 1. obtain the pdf -> download and read rom pdf
  console.log("downloading s3 into file system");
  const fileName = await downloadsFromS3(filekey);
  if (!fileName) {
    throw new Error("couldd not download from s3");
  }
  const loader = new PDFLoader(fileName);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf into pages
  const documents = await Promise.all(pages.map(prepareDocument));

  // 3. vectorize and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // 4. upload to pinecone
  const client = pc;
  const pineconeIndex = client.index("pdf");
  console.log("Inserting vectors into pinecone");
  const namespace = convertToAscii(filekey);

  pineconeIndex.upsert(vectors);

  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as Vector;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");

  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
