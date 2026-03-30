import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Products() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/");
    setTimeout(() => {
      document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);
  return null;
}
