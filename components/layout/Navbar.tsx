"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Navbar() {

    return (
        <nav className="w-full bg-gray-900 text-white p-4 flex justify-between items-center" >
            <div className="text-xl font-bold" > Saros Limit Orders </div>
            < div >
                <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 rounded-md px-4 py-2" />
            </div>
        </nav>
    );
}
