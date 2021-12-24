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
      title: "state/deploy",
      path: "/state/deploy",
    },
    {
      title: "state/useexistingAddress",
      path: "/state/useexistingAddress/0xcontractaddress",
    },
    {
      title: "product/deploy",
      path: "/product/deploy",
    },
    {
      title: "product/useexistingAddress",
      path: "/product/useexistingAddress/0xcontractaddress",
    },
    {
      title: "/product/0xNFTAddress",
      path: "/product/0xNFTAddress",
    },
    {
      title: "product/useexistingAddress/0xcontractaddress/tokenID",
      path: "/product/useexistingAddress/0xcontractaddress/tokenID",
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
