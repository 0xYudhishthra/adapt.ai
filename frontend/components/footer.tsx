"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="p-4 bg-background/80 border-t text-center text-sm"
    >
      © {new Date().getFullYear()} Adapt.ai. All rights reserved.
    </motion.footer>
  );
}

export default Footer;

