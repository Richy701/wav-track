import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload, IconX, IconMusic } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 10,
    y: -10,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onChange && onChange(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (index: number) => {
    setFiles((prevFiles) => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      onChange && onChange([]); // Notify parent that file was removed
      return newFiles;
    });
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-4 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden bg-background border border-border/60 hover:border-primary/60 transition-colors"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept="audio/*"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-50">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center relative z-10">
          {files.length === 0 ? (
            <>
              <p className="text-sm font-medium text-foreground">
                Upload audio file
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag or click to upload
              </p>
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-lg z-40 bg-background flex items-center justify-center h-20 mt-4 w-full max-w-[6rem] mx-auto rounded-md",
                  "border border-border/60 group-hover/file:border-primary/60 transition-colors"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-muted-foreground flex flex-col items-center text-xs"
                  >
                    Drop it
                    <IconUpload className="h-3 w-3 text-primary mt-1" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-3 w-3 text-primary" />
                )}
              </motion.div>
            </>
          ) : (
            <div className="w-full">
              {files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className="relative overflow-hidden z-40 bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/10 flex items-start p-3 rounded-xl border border-border/50 dark:border-border/30 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="p-2 rounded-lg bg-background border border-border/50 dark:border-border/30 text-foreground group-hover:border-primary/50 dark:group-hover:border-primary/30 transition-colors shrink-0 mr-3">
                    <IconMusic className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                          className="font-medium text-sm text-foreground truncate"
                          title={file.name}
                        >
                          {file.name}
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                          className="text-xs text-muted-foreground mt-0.5"
                        >
                          {file.type} • {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </motion.p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(idx);
                        }}
                      >
                        <IconX className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                      </Button>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="flex items-center gap-2 mt-2"
                    >
                      <span className="text-[10px] text-muted-foreground">
                        Modified {new Date(file.lastModified).toLocaleDateString()}
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 31;
  const rows = 7;
  return (
    <div className="flex bg-primary/5 dark:bg-primary/10 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-8 h-8 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-background"
                  : "bg-background shadow-[0px_0px_1px_1px_rgba(var(--primary-rgb),0.1)_inset] dark:shadow-[0px_0px_1px_1px_rgba(var(--primary-rgb),0.2)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
} 