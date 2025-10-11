import React, { useState } from 'react';
import { Modal, Card, Row, Col, Button, message, Typography, Space, Divider } from 'antd';
import { CheckOutlined, BookOutlined } from '@ant-design/icons';
import { COURSE_OPTIONS } from '@/constants/course';
import { updateUserCourses } from '@/services/auth';
import './index.less';

const { Title, Text } = Typography;

interface CourseSelectionModalProps {
  open: boolean;
  onSuccess: (selectedCourses: number) => void;
  initialCourses?: number; // 初始选择的课程（用于编辑模式）
}

const CourseSelectionModal: React.FC<CourseSelectionModalProps> = ({
  open,
  onSuccess,
  initialCourses,
}) => {
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // 当弹窗打开时，根据初始课程设置选中状态
  React.useEffect(() => {
    if (open && initialCourses !== undefined) {
      const initialSelectedCourses = [];
      for (const course of COURSE_OPTIONS) {
        if (initialCourses & course.code) {
          initialSelectedCourses.push(course.code);
        }
      }
      setSelectedCourses(initialSelectedCourses);
    } else if (open && initialCourses === undefined) {
      // 如果是首次选择（没有初始课程），清空选择
      setSelectedCourses([]);
    }
  }, [open, initialCourses]);

  // 处理课程选择
  const handleCourseToggle = (courseCode: number) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseCode)) {
        return prev.filter(code => code !== courseCode);
      } else {
        return [...prev, courseCode];
      }
    });
  };

  // 提交选择的课程
  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      message.warning('请至少选择一门课程');
      return;
    }

    setLoading(true);
    try {
      // 计算课程代码的总和（二进制位掩码）
      const coursesSum = selectedCourses.reduce((sum, code) => sum + code, 0);
      
      // 调用API更新用户课程
      await updateUserCourses({ courses: coursesSum });
      
      message.success('课程选择已保存！');
      onSuccess(coursesSum);
    } catch (error: any) {
      console.error('保存课程选择失败:', error);
      const errorMsg = error?.response?.data?.message || '保存失败，请重试';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      width={800}
      className="course-selection-modal"
      centered
    >
      <div className="modal-content">
        {/* 标题区域 */}
        <div className="header-section">
          <BookOutlined className="header-icon" />
          <Title level={3} className="header-title">
            选择您的课程
          </Title>
          <Text type="secondary" className="header-subtitle">
            请选择您本学期所学的课程，这将帮助我们为您提供更好的服务
          </Text>
        </div>

        <Divider />

        {/* 课程选择区域 */}
        <div className="courses-section">
          <Row gutter={[16, 16]}>
            {COURSE_OPTIONS.map((course) => {
              const isSelected = selectedCourses.includes(course.code);
              return (
                <Col xs={24} sm={12} md={8} key={course.value}>
                  <Card
                    className={`course-card ${isSelected ? 'selected' : ''}`}
                    hoverable
                    onClick={() => handleCourseToggle(course.code)}
                    bodyStyle={{ padding: '20px' }}
                  >
                    <div className="course-content">
                      <div className="course-header">
                        <Title level={5} className="course-title">
                          {course.label}
                        </Title>
                        {isSelected && (
                          <CheckOutlined className="check-icon" />
                        )}
                      </div>
                       <Text type="secondary" className="course-description">
                         {course.description}
                       </Text>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* 选择提示 */}
        {selectedCourses.length > 0 && (
          <div className="selection-info">
            <Text strong>
              已选择 {selectedCourses.length} 门课程
            </Text>
          </div>
        )}

        <Divider />

        {/* 操作按钮 */}
        <div className="footer-section">
          <Space size="large">
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleSubmit}
              disabled={selectedCourses.length === 0}
              className="submit-button"
            >
              确认选择 ({selectedCourses.length} 门课程)
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default CourseSelectionModal;
