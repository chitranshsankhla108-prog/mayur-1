"use server";

import { getProductsPage } from "@/lib/queries";

/** Server action backing the homepage "Load More" button. */
export async function loadMoreProducts(page: number) {
  return getProductsPage(page);
}
