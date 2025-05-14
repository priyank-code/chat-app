import React from "react";
import { parseMarkdown } from "./Helper";

const Answers = ({ data }) => {
  return (
    <div className="my-4 text-white leading-relaxed">
      {parseMarkdown(data)}
    </div>
  );
};

export default Answers;
