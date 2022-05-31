import { ref } from "vue";
import { storeLocal } from "./storage";

export const profile = storeLocal(
  "profile",
  ref({
    nickname: "",
    avatar: "",
    wallet: "",
  })
);

export const users = ref({});

// Keypair for signing user profile
export const signKeypair = storeLocal(
  "signKeypair",
  ref({
    publicKey: {},
    privateKey: {},
  })
);
