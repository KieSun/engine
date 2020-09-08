import { createComputed,  } from './reactive';
import { TYPE } from './reactive/effect';

export function watchOnce(computation, callback) {
  let result
  let isFirstRun = true
  const token = createComputed((watchAnyMutation) => {
    if (isFirstRun) {
      result = computation(watchAnyMutation)
      isFirstRun = false
    } else {
      // 变化以后执行 callback。如果 callback 里面没有依赖，那么久不会再执行了。
      callback()
    }
  }, TYPE.TOKEN)
  return [result, token]
}

export default function watch(computation, callback) {
  let result
  let isFirstRun = true
  const token = createComputed((watchAnyMutation) => {
    if (isFirstRun) {
      result = computation(watchAnyMutation)
      isFirstRun = false
    } else {
      computation(watchAnyMutation)
      callback()
    }
  }, TYPE.TOKEN)
  return [result, token]
}
