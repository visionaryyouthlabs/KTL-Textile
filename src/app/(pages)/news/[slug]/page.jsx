import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ArrowLeft } from "lucide-react";

import { client, urlFor } from "@/lib/sanity";

import ShareNews from "@/components/News/ShareNews";
import PortableTextRenderer from "@/components/PortableTextRenderer";

async function getBlog(slug) {
  const query = `
    *[_type == "blog" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      mainImage,
      excerpt,
      content,
      tags,
      publishedAt
    }
  `;

  return await client.fetch(query, { slug });
}

async function getLatestBlogs(currentId) {
  const query = `
    *[_type == "blog" && _id != $currentId]
    | order(publishedAt desc)[0...4]{
      _id,
      title,
      slug,
      mainImage,
      publishedAt
    }
  `;

  return await client.fetch(query, { currentId });
}

export async function generateMetadata({ params }) {

  const { slug } = await params;

  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: "News Not Found | KTL Textile",
    };
  }

  return {
    title: `${blog.title} | KTL Textile`,
    description:
      blog.excerpt ||
      "Latest textile industry news and updates from KTL Textile.",

    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: blog.mainImage
        ? [urlFor(blog.mainImage).url()]
        : [],
    },
  };
}

export default async function SingleNewsPage({ params }) {

  const { slug } = await params;

  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const latestBlogs = await getLatestBlogs(blog._id);

  return (
    <main className="w-full overflow-hidden bg-white">

      <section className="relative h-[55vh] md:h-[70vh]">

        <Image
          src={urlFor(blog.mainImage).url()}
          alt={blog.title}
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-14 text-white">

          <Link
            href="/news"
            className="inline-flex items-center gap-2 mb-6 text-sm hover:text-purple-300 transition"
          >
            <ArrowLeft size={18} />
            Back to News
          </Link>

          <div className="flex items-center gap-2 text-gray-200 mb-5">

            <CalendarDays size={18} />

            {new Date(blog.publishedAt).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold max-w-5xl leading-tight">

            {blog.title}

          </h1>
        </div>
      </section>

      <section className="pb-20 pt-10 px-6">

        <div className="max-w-4xl mx-auto">

          {blog.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              {blog.excerpt}
            </p>
          )}

          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed">

            <PortableTextRenderer value={blog.content} />

          </div>

          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-3 my-6">

              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-700 px-4 py-2 lowercase rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-16 pt-10 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-5">
              Share This Article
            </h3>

            <ShareNews title={blog.title} />
          </div>

        </div>
      </section>

      {/* Latest news */}
      <section className="py-20 px-6 bg-gray-50">

        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between flex-wrap gap-4 mb-14">

            <div>

              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Latest News
              </h2>

              <p className="text-gray-600">
                Explore more textile insights and market updates.
              </p>

            </div>

            <Link
              href="/news"
              className="text-purple-600 font-semibold hover:text-purple-800 transition"
            >
              View All News
            </Link>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

            {latestBlogs.map((item) => (

              <Link
                key={item._id}
                href={`/news/${item.slug.current}`}
                className="group overflow-hidden bg-white shadow-sm hover:shadow-2xl transition duration-500"
              >

                <div className="relative h-[220px] overflow-hidden">

                  <Image
                    src={urlFor(item.mainImage).url()}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-700"
                  />

                </div>

                <div className="p-6">

                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">

                    <CalendarDays size={15} />

                    {new Date(item.publishedAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-purple-600 transition">

                    {item.title}

                  </h3>
                </div>

              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}