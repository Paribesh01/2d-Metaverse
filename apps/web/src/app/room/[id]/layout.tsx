
"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";



const InnerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SessionProvider>
            <div className="inner-layout">

                {children}
            </div>
        </SessionProvider>
    );
};

export default InnerLayout;
