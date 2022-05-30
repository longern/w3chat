import { Ref, watch } from "vue"

export function storeLocal(key, variable: Ref<any>) {
  if (localStorage.getItem(key) !== null) {
    variable.value = JSON.parse(localStorage.getItem(key));
  }

  watch(variable, (value) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { deep: true });

  return variable;
}
