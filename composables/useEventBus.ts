/**
 * 简单的事件总线实现
 * 用于跨模块通信，解耦 Store 之间的依赖
 */

type EventCallback = (...args: any[]) => void

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map()

  /**
   * 订阅事件
   * @param event 事件名称
   * @param callback 回调函数
   * @returns 取消订阅的函数
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(callback)

    // 返回取消订阅函数
    return () => {
      this.off(event, callback)
    }
  }

  /**
   * 取消订阅事件
   * @param event 事件名称
   * @param callback 回调函数
   */
  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.events.delete(event)
      }
    }
  }

  /**
   * 发布事件
   * @param event 事件名称
   * @param args 传递给回调的参数
   */
  emit(event: string, ...args: any[]) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args)
        } catch (error) {
          console.error(`[EventBus] 事件 "${event}" 的回调执行失败:`, error)
        }
      })
    }
  }

  /**
   * 一次性订阅事件（触发后自动取消订阅）
   * @param event 事件名称
   * @param callback 回调函数
   */
  once(event: string, callback: EventCallback): () => void {
    const wrapper: EventCallback = (...args) => {
      callback(...args)
      this.off(event, wrapper)
    }
    return this.on(event, wrapper)
  }

  /**
   * 清除所有订阅
   */
  clear() {
    this.events.clear()
  }

  /**
   * 清除指定事件的所有订阅
   * @param event 事件名称
   */
  clearEvent(event: string) {
    this.events.delete(event)
  }
}

// 创建单例实例
const eventBus = new EventBus()

/**
 * 使用事件总线的 composable
 */
export function useEventBus() {
  return {
    /**
     * 订阅事件
     */
    on: (event: string, callback: EventCallback) => eventBus.on(event, callback),
    
    /**
     * 取消订阅事件
     */
    off: (event: string, callback: EventCallback) => eventBus.off(event, callback),
    
    /**
     * 发布事件
     */
    emit: (event: string, ...args: any[]) => eventBus.emit(event, ...args),
    
    /**
     * 一次性订阅事件
     */
    once: (event: string, callback: EventCallback) => eventBus.once(event, callback),
    
    /**
     * 清除所有订阅
     */
    clear: () => eventBus.clear(),
    
    /**
     * 清除指定事件的所有订阅
     */
    clearEvent: (event: string) => eventBus.clearEvent(event)
  }
}

// 导出事件名称常量
export const EVENTS = {
  PERFORMER_CHANGED: 'performer:changed'
} as const
