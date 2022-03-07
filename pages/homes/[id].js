// pages/homes/[id].js

import Image from 'next/image';
import Layout from '@/components/Layout';

import { PrismaClient } from '@prisma/client';

// Instantiate Prisma Client
const prisma = new PrismaClient();

const ListedHome = (home = null) => {
  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-x-4">
          <div>
            <h1 className="text-2xl font-semibold truncate">
              {home?.title ?? ''}
            </h1>
            <ol className="inline-flex items-center space-x-1 text-gray-500">
              <li>
                <span>{home?.guests ?? 0} guests</span>
                <span aria-hidden="true"> · </span>
              </li>
              <li>
                <span>{home?.beds ?? 0} beds</span>
                <span aria-hidden="true"> · </span>
              </li>
              <li>
                <span>{home?.baths ?? 0} baths</span>
              </li>
            </ol>
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden bg-gray-200 rounded-lg shadow-md aspect-video">
          {home?.image ? (
            <Image
              src={home.image}
              alt={home.title}
              layout="fill"
              objectFit="cover"
            />
          ) : null}
        </div>

        <p className="mt-8 text-lg">{home?.description ?? ''}</p>
      </div>
    </Layout>
  );
};

export default ListedHome;

export async function getStaticPaths() {
  // Get all the homes IDs from the database
  const homes = await prisma.home.findMany({
    select: { id: true },
  });

  return {
    paths: homes.map(home => ({
      params: { id: home.id },
    })),
    fallback: false,
  };
}       

export async function getStaticProps({ params }) {
  // Get the current home from the database
  const home = await prisma.home.findUnique({
    where: { id: params.id },
  });

  if (home) {
    return {
      props: JSON.parse(JSON.stringify(home)),
    };
  }

  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
}