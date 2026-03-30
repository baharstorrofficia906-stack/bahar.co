import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import ProductDetail from "./ProductDetail";

export default function Products() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const id = params.get("id");

  useEffect(() => {
    if (!id) {
      setLocation("/");
      setTimeout(() => {
        document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [id]);

  if (id) {
    return <ProductDetail id={parseInt(id)} />;
  }

  return null;
}
