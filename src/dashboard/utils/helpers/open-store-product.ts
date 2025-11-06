import { dashboard } from "@wix/dashboard";
const WIX_STORE_PAGE_ID = "0845ada2-467f-4cab-ba40-2f07c812343d"; // Page ID for Wix Store Products Page

export async function openProductEditPage(productId: string | undefined) {
  try {
    const pageUrl = await dashboard.getPageUrl({
      pageId: WIX_STORE_PAGE_ID,
      relativeUrl: `/product/${productId}`, // Relative URL for the product
    });
    window.open(pageUrl, "_blank", "noopener"); // Open the product edit page in a new tab
  } catch (error) {
    console.error("Failed to open product edit page:", error);
    alert(
      "Failed to open the Store product edit page. Please try again later."
    ); // User-friendly error message
  }
}
