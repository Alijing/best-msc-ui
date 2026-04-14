/**
 * 演员信息相关类型定义
 */

/**
 * 演员信息数据模型（列表显示用，字段为文本）
 */
export interface VideoPerformer {
    // 演员id
    id: string | number
    // 演员姓名
    name: string
    // 演员英文名
    enUsName: string
    // 演员生日
    birthday: string
    // 演员身高
    height: number
    // 演员胸围
    bust: number
    // 演员腰围
    waistSize: number
    // 演员臀围
    hipCircumference: number
    // 演员cup尺寸
    cupSize: string
    // 演员爱好
    hobby: string
    // 演员备注
    remark: string
}
