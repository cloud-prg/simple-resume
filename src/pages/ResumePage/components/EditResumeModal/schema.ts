export default {
    displayType: 'row',
    column: 3,
    properties: {
        name: {
            type: 'string',
            title: '模板名称',
            widget: 'input',
            required: true,
            props: {
                maxLength: 10
            },
            placeholder: '请输入模板名称'
        },
        contact: {
            type: 'object',
            title: "联系方式",
            properties: {
                name: {
                    title: '姓名',
                    type: 'string',
                    widget: 'input',
                    required: true,
                    placeholder: '请输入您的姓名'
                },
                phone: {
                    title: '电话',
                    type: 'string',
                    widget: 'input',
                    required: true,
                    placeholder: '请输入您的电话号码'
                },
                email: {
                    title: '邮箱',
                    type: 'string',
                    widget: 'input',
                    required: true,
                    placeholder: '请输入您的邮箱地址'
                },
                address: {
                    title: '地址',
                    type: 'string',
                    widget: 'input',
                    placeholder: '请输入您的地址'
                },
                career: {
                    title: '求职意向',
                    type: 'string',
                    widget: 'input',
                    required: true,
                    placeholder: '请输入您的求职意向'
                },
                location: {
                    title: '地点',
                    type: 'string',
                    widget: 'input',
                    placeholder: '请输入您的工作地点'
                }
            }
        },
        education: {
            type: 'object',
            title: "教育经历",
            properties: {
                degree: {
                    title: '学位',
                    type: 'string',
                    widget: 'input',
                    required: true,
                    placeholder: '请输入您的学位'
                },
                major: {
                    title: '专业',
                    type: 'string',
                    widget: 'input',
                    required: true,
                    placeholder: '请输入您的专业'
                },
                school: {
                    title: '学校',
                    type: 'string',
                    widget: 'input',
                    required: true,
                    placeholder: '请输入您的学校名称'
                },
                startDate: {
                    title: '开始日期',
                    spanatype: 'string',
                    widget: 'datePicker',
                    props: {
                        format: 'YYYY/MM',
                        picker: "month"
                    },
                    // required: true,
                    placeholder: '请输入开始日期'
                },
                endDate: {
                    title: '结束日期',
                    spanatype: 'string',
                    widget: 'datePicker',
                    props: {
                        format: 'YYYY/MM',
                        picker: "month"
                    },
                    required: true,
                    placeholder: '请输入结束日期'
                }
            }
        },
        experience: {
            type: 'array',
            title: '工作经历',
            items: {
                type: 'object',
                properties: {
                    company: {
                        title: '公司',
                        type: 'string',
                        widget: 'input',
                        placeholder: '请输入公司名称'
                    },
                    project: {
                        title: '项目',
                        type: 'string',
                        widget: 'input',
                        placeholder: '请输入项目名称'
                    },
                    career: {
                        title: '职位',
                        type: 'string',
                        widget: 'input',
                        placeholder: '请输入您的职位'
                    },
                    startDate: {
                        title: '开始日期',
                        type: 'string',
                        widget: 'datePicker',
                        props: {
                            format: 'YYYY/MM',
                            picker: "month"
                        },

                        placeholder: '请输入开始日期'
                    },
                    endDate: {
                        title: '结束日期',
                        type: 'string',
                        widget: 'datePicker',
                        props: {
                            format: 'YYYY/MM',
                            picker: "month",
                        },

                        placeholder: '请输入结束日期'
                    },
                    keywords: {
                        title: '关键词',
                        type: 'array',
                        widget: 'keywordsList',
                    },
                    workContent: {
                        title: '工作内容',
                        type: 'array',
                        widget: 'simpleList',
                        style: {
                            width: '600px',
                            border: '1px solid red'
                        },
                        props: {
                            hasBackground: true,
                        },
                        items: {
                            type: 'object',
                            properties: {
                                value: {
                                    type: 'string',
                                    widget: 'input',
                                    props: {
                                        style: {
                                            width: '45vw'
                                        }
                                    },
                                    placeholder: '请输入工作内容'
                                }
                            }
                        }
                    },
                    summary: {
                        title: '业绩',
                        type: 'array',
                        widget: 'simpleList',
                        props: {
                            hasBackground: true,
                            style: {
                                border: '1px solid red'
                            }
                        },
                        items: {
                            type: 'object',
                            properties: {
                                value: {
                                    type: 'string',
                                    widget: 'input',
                                    props: {
                                        style: {
                                            width: '45vw'
                                        }
                                    },
                                    placeholder: '请输入业绩'
                                }
                            }
                        }
                    },
                }
            }
        }
    }
};