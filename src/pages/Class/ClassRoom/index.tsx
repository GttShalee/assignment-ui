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

const { Title, Text } = Typography;
const { Search } = Input;

const ClassRoom: React.FC = () => {
  const { userInfo } = useModel('global');
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // 每页显示5个用户

  // 获取班级成员列表
  const fetchClassMembers = async () => {
    if (!userInfo?.classCode) {
      message.error('无法获取班级信息');
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
      
      setMembers(processedMembers);
    } catch (error) {
      message.error('获取班级成员失败');
      console.error('获取班级成员失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassMembers();
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
        return <Tag color="red" icon={<CrownOutlined />}>管理员</Tag>;
      case 2:
        return <Tag color="blue" icon={<CrownOutlined />}>学委</Tag>;
      default:
        return <Tag color="green">学生</Tag>;
    }
  };

  // 获取班级名称
  const getClassName = (classCode: string) => {
    const classCodeMap: { [key: string]: string } = {
      '1234': '计科23-1',
      '2005': '计科23-2', 
      '1111': '计科23-3',
      '8888': '计科智能'
    };
    return classCodeMap[classCode] || classCode;
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
                             src={member.avatarUrl}
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

        {/* 右侧：两个空白板块 */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" style={{ width: '100%' }} size={24}>
            {/* 第一个空白板块 */}
            <Card 
              title="板块一" 
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
