// pages/homes/[id].js
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import prisma from 'lib/prisma';

// Instantiate Prisma Client
;

const ListedHome = (home = null) => {
  const { data: session } = useSession();
  const [isOwner, setIsOwner] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Retrieve the Next.js router
  const router = useRouter();


  useEffect(() => {
    (async () => {
      if (session?.user) {
        try {
          const owner = await axios.get(`/api/homes/${home.id}/owner`);
          setIsOwner(owner?.id === session.user.id);
        } catch (e) {
          setIsOwner(false);
        }
      }
    })();
  }, [session?.user]);

  const deleteHome = async () => {
    let toastId;
    try {
      toastId = toast.loading('Deleting...');
      setDeleting(true);
      // Delete home from DB
      await axios.delete(`/api/homes/${home.id}`);
      // Redirect user
      toast.success('Successfully deleted', { id: toastId });
      router.push('/homes');
    } catch (e) {
      console.log(e);
      toast.error('Unable to delete home', { id: toastId });
      setDeleting(false);
    }
  };
  

  // Fallback version
  if (router.isFallback) {
  	return 'Loading...'; 
  }
  
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
          {isOwner ? (
            <div className="...">
              <button
                type="button"
                disabled={deleting}
                onClick={() => router.push(`/homes/${home.id}/edit`)}
                className="px-4 py-1 mr-2 text-gray-800 transition border border-gray-800 rounded-md hover:bg-gray-800 hover:text-white disabled:text-gray-800 disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Edit
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={deleteHome}
                className="px-4 py-1 transition border rounded-md border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white focus:outline-none disabled:bg-rose-500 disabled:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ) : null}
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
    fallback: true,
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