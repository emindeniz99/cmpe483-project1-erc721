import "../styles/globals.css";
import type { AppProps } from "next/app";
import Web3js from "../components/Web3js";
import Link from "next/link";

function MyApp({ Component, pageProps }: AppProps) {
  const links: { path: string; title: string }[] = [
    {
      title: "Home",
      path: "/",
    },
    {
      title: "State contract",
      path: "/state/deploy",
    },

    {
      title: "Product contract",
      path: "/product/deploy",
    },
  ];
  return (
    <Web3js>
      <div>
        {links.map((l, i) => (
          <Link key={i} href={l.path}>
            <button style={{ margin: "1rem", backgroundColor: "red" }}>
              {l.title}
            </button>
          </Link>
        ))}
      </div>

      <Component {...pageProps} />
    </Web3js>
  );
}

export default MyApp;
