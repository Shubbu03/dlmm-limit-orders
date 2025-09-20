'use client';
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { dlmm } from "@/lib/dlmm";

export default function Home() {
  useEffect(() => {
    console.log("DLMM instance:", dlmm);
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            DLMM Limit Orders
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Automated trading with Dynamic Liquidity Market Maker
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link
            href="/orders/new"
            className="group p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Place New Order
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Set your target price and amount
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/orders"
            className="group p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                  View Orders
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your active orders
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How it works
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
            <li>• Connect your Solana wallet</li>
            <li>• Choose a token pair and set your target price</li>
            <li>• Your order will be placed in the appropriate liquidity bin</li>
            <li>• Orders execute automatically when price conditions are met</li>
          </ul>
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-gray-600 dark:text-gray-400"
          href="https://github.com/saros-finance/dlmm-sdk"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          DLMM SDK
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-gray-600 dark:text-gray-400"
          href="https://saros.finance"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Saros Finance
        </a>
      </footer>
    </div>
  );
}
