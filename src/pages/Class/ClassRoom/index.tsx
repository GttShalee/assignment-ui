import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Space, 
  Tag, 
  message,
  Button,
  Input,
  Empty,
  Pagination
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  CrownOutlined,
  MailOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { getClassMembers, ClassMember } from '@/services/classroom';
import { getFullAvatarUrl } from '@/utils/avatar';
import { CLASS_CODE_MAP, ROLE_TYPE_MAP } from '@/constants/config';
import HomeworkSubmissionRecords from '@/components/HomeworkSubmissionRecords';

const { Title, Text } = Typography;
const { Search } = Input;

const ClassRoom: React.FC = () => {
  const { userInfo } = useModel('global');
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7; // 每页显示5个用户

  // 获取班级成员列表
  const fetchClassMembers = async () => {
    if (!userInfo?.classCode) {
      console.log('ClassRoom - 用户班级代码为空，跳过获取班级成员');
      return;
    }

    setLoading(true);
    try {
      const response = await getClassMembers(userInfo.classCode);
      
      // 处理数据，确保字段存在
      const processedMembers = (response.content || []).map(member => {
        const anyMember = member as any;
        return {
          ...member,
          realName: member.realName || anyMember.name || anyMember.username || anyMember.real_name || '未知用户',
          studentId: member.studentId || anyMember.student_id || anyMember.id || '未知',
          avatarUrl: member.avatarUrl || anyMember.avatar_url || anyMember.avatar || undefined,
        };
      });
      
      console.log('ClassRoom - 获取班级成员成功:', processedMembers.length, '人');
      setMembers(processedMembers);
    } catch (error) {
      message.error('获取班级成员失败');
      console.error('ClassRoom - 获取班级成员失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 当用户信息加载完成后，获取班级成员
  useEffect(() => {
    if (userInfo?.classCode) {
      console.log('ClassRoom - 用户信息已加载，班级代码:', userInfo.classCode);
      fetchClassMembers();
    }
  }, [userInfo?.classCode]);

  // 过滤成员列表
  const filteredMembers = members.filter(member => 
    (member.realName?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (member.studentId || '').includes(searchText)
  );

  // 分页处理
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);
  const totalMembers = filteredMembers.length;

  // 获取角色标签
  const getRoleTag = (roleType: number) => {
    switch (roleType) {
      case 0:
        return <Tag color="red" icon={<CrownOutlined />}>{ROLE_TYPE_MAP[0]}</Tag>;
      case 2:
        return <Tag color="blue" icon={<CrownOutlined />}>{ROLE_TYPE_MAP[2]}</Tag>;
      default:
        return <Tag color="green">{ROLE_TYPE_MAP[1]}</Tag>;
    }
  };

  // 获取班级名称
  const getClassName = (classCode: string) => {
    return CLASS_CODE_MAP[classCode] || classCode;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3} style={{ marginBottom: '24px' }}>
        <TeamOutlined style={{ marginRight: '8px' }} />
        班级空间 - {userInfo?.classCode ? getClassName(userInfo.classCode) : '未知班级'}
      </Title>

      <Row gutter={24}>
        {/* 左侧：成员列表 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <UserOutlined />
                班级成员 ({totalMembers})
              </Space>
            }
                         extra={
               <Search
                 placeholder="搜索姓名或学号"
                 allowClear
                 style={{ width: 200 }}
                 onChange={(e) => {
                   setSearchText(e.target.value);
                   setCurrentPage(1); // 搜索时重置到第一页
                 }}
               />
             }
            loading={loading}
          >
                         {totalMembers === 0 ? (
               <Empty 
                 description="暂无成员信息" 
                 image={Empty.PRESENTED_IMAGE_SIMPLE}
               />
             ) : (
              <>
                <List
                  dataSource={paginatedMembers}
                  renderItem={(member) => (
                    <List.Item>
                      <List.Item.Meta
                                                                         avatar={
                          <Avatar 
                            size={48}
                            src={getFullAvatarUrl(member.avatarUrl)}
                            icon={<UserOutlined />}
                            onError={() => false}
                          >
                            {member.realName?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        }
                                                 title={
                           <Space>
                             <Text strong>{member.realName || '未知用户'}</Text>
                             {getRoleTag(member.roleType)}
                           </Space>
                         }
                        description={
                          <Space direction="vertical" size={0}>
                            <Space>
                              <IdcardOutlined />
                              <Text type="secondary">学号：{member.studentId || '未知'}</Text>
                            </Space>
                            {member.email && (
                              <Space>
                                <MailOutlined />
                                <Text type="secondary">{member.email}</Text>
                              </Space>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
                
                {/* 分页组件 */}
                {totalMembers > pageSize && (
                  <div style={{ 
                    marginTop: 16, 
                    textAlign: 'center',
                    paddingTop: 16,
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <Pagination
                      current={currentPage}
                      total={totalMembers}
                      pageSize={pageSize}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total, range) => 
                        `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                      }
                      onChange={(page) => {
                        setCurrentPage(page);
                        // 滚动到顶部
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>

        {/* 右侧：作业提交动态和其他板块 */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" style={{ width: '100%' }} size={24}>
            {/* 作业提交记录板块 */}
            <HomeworkSubmissionRecords pageSize={8} />

            {/* 第二个空白板块 */}
            <Card 
              title="板块二" 
              style={{ minHeight: 300 }}
              extra={<Button type="link">更多</Button>}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: 200,
                color: '#999'
              }}>
                <Empty 
                  description="待开发功能" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default ClassRoom;
