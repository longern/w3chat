import { ref } from "vue";
import { storeLocal } from "./storage"

export const profile = storeLocal("profile", ref({
  nickname: "",
  avatar: "",
  wallet: "",
}))
