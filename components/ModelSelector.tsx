import React from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Badge } from "./ui/badge";
import { assets } from "@/public/assets/assets";

export type AIModel = {
  id: string;
  name: string;
  company: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  features: string[];
};

export const aiModels: AIModel[] = [
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    company: "Anthropic",
    icon: (
      <Image
        src={assets.anthropic_icon}
        alt="Anthropic"
        width={16}
        height={16}
      />
    ),
    color: "claude",
    description: "Most capable model for complex reasoning",
    features: ["Reasoning", "Analysis", "Coding"],
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    company: "OpenAI",
    icon: (
      <Image src={assets.openai_icon} alt="OpenAI" width={17} height={17} />
    ),
    color: "openai",
    description: "Advanced multimodal AI model",
    features: ["Multimodal", "Fast", "Creative"],
  },
  {
    id: "llama-3.1",
    name: "Llama 3.1",
    company: "Meta",
    icon: <Image src={assets.meta_icon} alt="Meta" width={16} height={16} />,
    color: "meta",
    description: "Open source powerhouse",
    features: ["Open Source", "Efficient", "Versatile"],
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    company: "Google",
    icon: (
      <Image src={assets.gemini_icon} alt="Gemini" width={16} height={16} />
    ),
    color: "gemini",
    description: "Google's most capable AI model",
    features: ["Long Context", "Multimodal", "Fast"],
  },
];

type ModelSelectorProps = {
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
};

const ModelSelector = ({
  selectedModel,
  setSelectedModel,
}: ModelSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1.5 border hover:cursor-pointer"
        >
          {selectedModel.icon}
          <span className="hidden sm:inline text-xs font-medium">
            {selectedModel.name}
          </span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 flex flex-col gap-3">
        {aiModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => {
              setSelectedModel(model);
            }}
            className={`p-3 cursor-pointer ${
              model.id === selectedModel.id && "bg-accent"
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-lg">{model.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{model.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {model.company}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {model.description}
                </p>
                <div className="flex gap-1 flex-wrap">
                  {model.features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="text-xs px-1.5 py-0"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;
