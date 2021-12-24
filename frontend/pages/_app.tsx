import "../styles/globals.css";
import type { AppProps } from "next/app";
import Web3js from "../components/Web3js";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3js>
      <Component {...pageProps} />
    </Web3js>
  );
}

export default MyApp;
