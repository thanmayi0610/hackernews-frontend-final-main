"use client";

import React from "react";
import Link from "next/link";
import { betterAuthClient } from "@/app/lib/integrations/better-auth";
import SearchBar from "../search-bar/SearchBar";
const NavigationBar = () => {
  const { data } = betterAuthClient.useSession();
  const navItems = [
    { label: "new", href: "/new" },
    { label: "past", href: "/past" },
    { label: "comments", href: "/comments" },
    { label: "submit", href: "/submit" },
  ];
  return (
    <nav className="fixed top-1 left-0 right-0 z-50 bg-orange-500 hover:bg-yellow-500 text-black text-1xl font-sans max-w-screen-lg mx-auto  w-full rounded-md">
      <div className="w-full flex items-center justify-between px-3 py-1">
        <div className="flex items-center flex-wrap gap-2">
          <Link href="/" className="font-bold text-black">
            Hacker News
          </Link>
          {navItems.map((item) => (
            <React.Fragment key={item.label}>
              <span className="text-black">|</span>
              <Link href={item.href}>{item.label}</Link>
            </React.Fragment>
          ))}
        </div>{" "}
        <SearchBar />
        <div className="flex items-center gap-2">
          {data?.user ? (
            <button
              onClick={() => betterAuthClient.signOut()}
              className="hover:underline"
            >
              logout
            </button>
          ) : (
            <Link href="/login" className="hover:underline">
              login
            </Link>
          )}
        </div>
        
      </div>
    </nav>
  );
};
export default NavigationBar;
