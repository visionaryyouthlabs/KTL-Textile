import { NextResponse } from "next/server";

import { client } from "@/lib/sanity";

export async function GET(req) {

    try {

        const { searchParams } = new URL(req.url);

        const query = searchParams.get("q");

        // Empty query
        if (!query) {
            return NextResponse.json({
                products: [],
                blogs: [],
            });
        }

        const sanityQuery = `{

      "products": *[
        _type == "product" &&
        (
          title match $search ||
          sku match $search ||
          seriesId match $search ||
          tags[] match $search ||
          colors[] match $search
        )
      ][0...8]{
        _id,
        title,
        slug,
        image,
        stockStatus,
        seriesId,
        sku,
        price,
        category->{
          name
        }
      },

      "blogs": *[
        _type == "blog" &&
        (
          title match $search ||
          excerpt match $search ||
          tags[] match $search
        )
      ][0...8]{
        _id,
        title,
        slug,
        mainImage,
        publishedAt
      }

    }`;

        const data = await client.fetch(sanityQuery, {
            search: `*${query}*`,
        });

        return NextResponse.json(data);

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                products: [],
                blogs: [],
            },
            { status: 500 }
        );
    }
}