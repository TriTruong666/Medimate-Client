import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Props {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
}

export const ScrollReveal = ({ children, width = "fit-content" }: Props) => {
  const ref = useRef(null);
  // amount: 0.3 -> Chỉ cần 30% phần tử xuất hiện là bắt đầu chạy
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  // Cấu hình Animation
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 75,
      rotateX: 25, // Tạo góc nghiêng 3D
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
    },
  };

  return (
    <div
      ref={ref}
      style={{ width, position: "relative", perspective: "1000px" }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{
          // Sử dụng Spring thay vì Duration
          type: "spring",
          stiffness: 70, // Độ cứng (thấp = chậm mượt, cao = bật mạnh)
          damping: 15, // Độ giảm chấn (càng thấp càng rung nhiều)
          mass: 0.8, // Khối lượng (nhẹ thì bay nhanh hơn)
          delay: 0.2,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
