import React, { FC } from "react";

export const Footer: FC = () => {
  return (
    <footer className="flex-1 md:p-0 lg:pt-8 lg:px-8 md:ml-24 flex flex-col">
      <section className="p-4 shadow bg-cream-light rounded-md">
        <div className="mx-auto container overflow-hidden flex flex-col lg:flex-row justify-center">
          <a
            href="#"
            className="block text-xl leading-none select-none"
          >
            <p className="text-sm font-light">© 2022 Crypto Checker - Made with ❤️</p>
          </a>
        </div>
      </section>
    </footer>
  );
};
