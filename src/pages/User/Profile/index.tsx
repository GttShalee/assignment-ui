import React, { ReactNode, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Avatar, Button, Tag } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import styles from './index.less';

const UserProfile: React.FC = () => {
  const { userInfo } = useModel('global');
  const [avatarError, setAvatarError] = useState(false);

  // 获取头像URL（兼容avatar_url和avatarUrl）
  const avatarUrl = userInfo?.avatarUrl || (userInfo as any)?.avatar_url;

  // 角色标注
  let roleLabel: ReactNode = '-';
  if (userInfo?.role === 1 || userInfo?.roleType === 1) {
    roleLabel = <Tag color="blue">学生</Tag>;
  } else if (userInfo?.role) {
    roleLabel = String(userInfo.role);
  }

  // 班级代码转中文
  let classLabel: ReactNode = userInfo?.classCode || '-';
  if (userInfo?.classCode === '1234') {
    classLabel = '计科23-2班';
  }

  // 构造表格数据
  const dataSource: { key: string; label: string; value: ReactNode }[] = [
    { key: 'realName', label: '姓名', value: userInfo?.realName || '-' },
    { key: 'studentId', label: '学号', value: userInfo?.studentId || '-' },
    { key: 'email', label: '邮箱', value: userInfo?.email || '-' },
    { key: 'classCode', label: '班级', value: classLabel },
    { key: 'createdAt', label: '创建时间', value: userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleString() : '-' },
  ];

  // 头像渲染逻辑
  let avatarNode: ReactNode = <Avatar size={80} icon={<UserOutlined />} className={styles.avatar} />;
  if (userInfo && avatarUrl && !avatarError) {
    avatarNode = <Avatar size={80} src={avatarUrl} className={styles.avatar} alt="头像" onError={() => { setAvatarError(true); return false; }} />;
  } else if (userInfo?.realName) {
    avatarNode = <Avatar size={80} className={styles.avatar}>{userInfo.realName.charAt(0)}</Avatar>;
  }

  return (
    <PageContainer>
      <div className={styles.profileWrap}>
        <Card className={styles.profileCard}>
          <div className={styles.headerRow}>
            {avatarNode}
            <div className={styles.userInfoText}>
              <div className={styles.nameRow}>
                <h2>{userInfo?.realName || '未登录'}</h2>
                <p>{roleLabel}</p>
              </div>
              <p>学号：{userInfo?.studentId || '-'}</p>
            </div>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              className={styles.editBtn}
              disabled
            >
              编辑信息
            </Button>
          </div>

          <Table
            dataSource={dataSource}
            columns={[
              { title: '字段', dataIndex: 'label', key: 'label', width: 120, className: styles.tableLabel },
              { title: '内容', dataIndex: 'value', key: 'value', className: styles.tableValue },
            ]}
            pagination={false}
            rowKey="key"
            bordered
            size="middle"
            className={styles.infoTable}
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default UserProfile; 