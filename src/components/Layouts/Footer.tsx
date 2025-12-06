const Footer = () => {
  return (
    <div className="dark:text-white-dark text-center ltr:sm:text-left rtl:sm:text-right p-6 pt-0 mt-auto">
      © {new Date().getFullYear()}.
      <span
        onClick={() => window.open("https://do365tech.com", "_blank")}
        className="cursor-pointer hover:text-blue-800 ml-1"
      >
        DO365 TECHNOLOGIES All rights reserved.
      </span>
    </div>
  );
};

export default Footer;
