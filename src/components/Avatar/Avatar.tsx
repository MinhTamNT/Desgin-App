import { Tooltip } from "@mui/material";
import styles from "./avatar.module.css";

const IMAGE_SIZE = 48;

export function Avatar({ src, name }: { src: string; name: string }) {
  return (
    <div className={`${styles.avatar} relative flex flex-col items-center`}>
      <Tooltip title={name} placement="bottom">
        <img
          src={src}
          height={IMAGE_SIZE}
          width={IMAGE_SIZE}
          className={`${styles.avatar_picture} rounded-full`}
          alt={name}
        />
      </Tooltip>
    </div>
  );
}
