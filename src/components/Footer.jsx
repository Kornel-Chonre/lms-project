const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-8">
      <div className="container mx-auto text-center text-sm">
        &copy; {new Date().getFullYear()} LMS Project. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
