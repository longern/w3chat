import { Ref, watch } from "vue";

export function storeLocal<T = any>(key: string, variable: Ref<T>) {
  if (localStorage.getItem(key) !== null) {
    variable.value = JSON.parse(localStorage.getItem(key));
  }

  watch(
    variable,
    (value) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { deep: true }
  );

  return variable;
}
