"use client";

import React, { Component, forwardRef, useEffect, useMemo } from "react";
import { fromJSON, validate } from "@siren/schema";

interface DiagramPreviewProps {
  code: string;
  onError: (error: string | null) => void;
}

class DiagramErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  state = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      errorMessage: error.message || "Unknown rendering error",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[siren] Diagram render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center p-4 text-sm text-destructive">
          {this.state.errorMessage}
        </div>
      );
    }

    return this.props.children;
  }
}

function PreviewInner({ code, onError }: DiagramPreviewProps) {
  const { schema, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(code);
      const result = validate(parsed);

      if (!result.valid) {
        return {
          schema: null,
          error: result.errors?.map((e) => e.message).join(", ") ?? "Invalid schema",
        };
      }

      return { schema: result.data!, error: null };
    } catch (err) {
      if (code.trim().length > 2) {
        return {
          schema: null,
          error: err instanceof Error ? err.message : "Parse error",
        };
      }

      return { schema: null, error: null };
    }
  }, [code]);

  useEffect(() => {
    onError(error);
  }, [error, onError]);

  if (!schema) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Write valid Siren JSON to see a preview
      </div>
    );
  }

  return <DiagramErrorBoundary key={code}>{fromJSON(schema)}</DiagramErrorBoundary>;
}

export const DiagramPreview = forwardRef<HTMLDivElement, DiagramPreviewProps>(
  function DiagramPreview(props, ref) {
    return (
      <div ref={ref} className="h-full w-full">
        <PreviewInner {...props} />
      </div>
    );
  }
);
