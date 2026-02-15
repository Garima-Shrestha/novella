"use client";

import React from "react";

type Category = {
  _id: string;
  name: string;
};

interface CategoryPageProps {
  categories: Category[];
}

const capitalizeFirstLetter = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

export default function CategoryPage({ categories }: CategoryPageProps) {
  if (!categories || categories.length === 0) {
    return <p className="text-gray-500">No categories available</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {categories.map((category) => (
        <h2 key={category._id} className="font-bold text-lg">
          {capitalizeFirstLetter(category.name)}
        </h2>
      ))}
    </div>
  );
}
