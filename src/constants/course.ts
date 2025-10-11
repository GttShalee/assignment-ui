// 课程配置文件
export interface CourseOption {
  value: string;
  label: string;
  description?: string;
  code: number; // 课程代码（二进制位掩码）
}

// 所有可选课程列表
export const COURSE_OPTIONS: CourseOption[] = [
  {
    value: 'software_engineering',
    label: '软件工程',
    description: '软件开发生命周期、项目管理等',
    code: 1
  },
  {
    value: 'microcomputer_interface',
    label: '微机接口',
    description: '微机原理与接口技术',
    code: 2
  },
  {
    value: 'operating_system',
    label: '操作系统',
    description: '进程管理、内存管理、文件系统等',
    code: 4
  },
  {
    value: 'ai_introduction',
    label: '人工智能导论',
    description: '人工智能基础理论与应用',
    code: 8
  },
  {
    value: 'computer_organization',
    label: '组成原理',
    description: '计算机组成原理与体系结构',
    code: 16
  },
  {
    value: 'neural_network',
    label: '神经网络',
    description: '神经网络原理与深度学习',
    code: 32
  },
  {
    value: 'big_data_analysis',
    label: '大数据分析',
    description: '大数据处理技术与分析方法',
    code: 64
  }
];

// 根据值获取课程标签
export const getCourseLabel = (value: string): string => {
  const course = COURSE_OPTIONS.find(option => option.value === value);
  return course ? course.label : value;
};

// 根据标签获取课程值
export const getCourseValue = (label: string): string => {
  const course = COURSE_OPTIONS.find(option => option.label === label);
  return course ? course.value : label;
};

// 根据课程值获取课程代码
export const getCourseCode = (value: string): number => {
  const course = COURSE_OPTIONS.find(option => option.value === value);
  return course ? course.code : 0;
};

// 根据课程代码获取课程信息
export const getCourseByCode = (code: number): CourseOption | undefined => {
  return COURSE_OPTIONS.find(option => option.code === code);
};

// 课程选项（用于Select组件）
export const getCourseSelectOptions = () => {
  return COURSE_OPTIONS.map(course => ({
    label: course.label,
    value: course.value,
    title: course.description // 鼠标悬停时显示描述
  }));
};
