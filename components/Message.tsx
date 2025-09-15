import Image from "next/image";
import { assets } from "@/public/assets/assets";
import { AIModel } from "./ModelSelector";
import { ThreeDot } from "react-loading-indicators";
import { CircleAlert } from "lucide-react";

type MessageProps = {
  role: "user" | "assistant";
  prompt: string;
  model: AIModel;
  timestamp: Date;
  isError?: boolean;
};

const Message = ({
  message,
  isLoading,
}: {
  message: MessageProps;
  isLoading: boolean;
}) => {
  const { role, prompt, isError } = message;
  console.log(isLoading);

  return role === "user" ? (
    <div className="w-full min-w-4xl mb-6 flex justify-end">
      <div className="max-w-[70%] flex flex-col gap-2 items-end">
        <div className="rounded-lg bg-muted px-3.5 py-2">{prompt}</div>
        <div className="mt-2 flex items-center gap-3 text-muted-foreground">
          <Image
            src={assets.copy_icon}
            alt="Copy"
            className="w-4.5 cursor-pointer"
          />
          <Image
            src={assets.pencil_icon}
            alt="Edit"
            className="w-4.5 cursor-pointer"
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full min-w-4xl mb-6 flex justify-start gap-3">
      <Image src={assets.synthora_icon} alt="" className="w-8 h-8" />
      <div className="flex flex-col max-w-[70%] gap-2">
        {isLoading ? (
          <span className="inline-flex items-center" style={{ height: "20px" }}>
            <ThreeDot variant="pulsate" color="#4D94FE" size="small" />
          </span>
        ) : isError ? (
          <div className="px-3.5 py-2 flex items-center gap-2 text-destructive">
            <CircleAlert className="w-4 h-4" />
            {prompt}
          </div>
        ) : (
          <div className="px-3.5 py-2"> {prompt}</div>
        )}
        <div className="mt-2 flex items-center gap-3 text-muted-foreground">
          <Image
            src={assets.copy_icon}
            alt="Copy"
            className="w-4.5 cursor-pointer"
          />
          <Image
            src={assets.regenerate_icon}
            alt="Regenerate"
            className="w-4.5 cursor-pointer"
          />
          <Image
            src={assets.like_icon}
            alt="Like"
            className="w-4.5 cursor-pointer"
          />
          <Image
            src={assets.dislike_icon}
            alt="Dislike"
            className="w-4.5 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Message;
