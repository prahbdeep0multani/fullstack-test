import { useEffect, useState } from 'react';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import CostInput from '../core/controls/CostInput';

const { Option } = Select;

const typeOptions = [
  { value: 'expense', icon: <ArrowDownOutlined className="text-red-500" /> },
  { value: 'income', icon: <ArrowUpOutlined className="text-green-600" /> }
];

const EntryForm = ({ open, entry, onSave, onCancel, categories = [] }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (entry) {
        form.setFieldsValue({
          type: entry.type,
          amount: entry.amount,
          description: entry.description || '',
          category: entry.category || undefined,
          date: entry.date ? dayjs(entry.date) : dayjs()
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ date: dayjs() });
      }
    }
  }, [open, entry, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        setLoading(true);
        const payload = {
          ...values,
          category: Array.isArray(values.category) ? values.category[0] : values.category,
          date: values.date ? values.date.toISOString() : new Date().toISOString()
        };
        return onSave(payload);
      })
      .then(() => {
        setLoading(false);
        form.resetFields();
      })
      .catch(() => setLoading(false));
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const categoryOptions = categories.map(c => ({ value: c, label: c }));

  return (
    <Modal
      title={entry ? t('common.edit') : t('entries.addEntry')}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={entry ? t('common.save') : t('entries.addEntry')}
      cancelText={t('common.cancel')}
      width={480}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item name="type" label={t('common.type')} rules={[{ required: true, message: t('validation.required') }]}>
          <Select placeholder={t('common.type')}>
            {typeOptions.map(({ value, icon }) => (
              <Option key={value} value={value}>
                <span className="flex items-center gap-2">
                  {icon}
                  {t(`entries.${value}`)}
                </span>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="amount"
          label={t('entries.amount')}
          rules={[{ required: true, message: t('validation.required') }]}
        >
          <CostInput style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="description" label={t('common.description')}>
          <Input placeholder={t('common.description')} maxLength={500} />
        </Form.Item>

        <Form.Item name="category" label={t('common.category')}>
          <Select
            mode="tags"
            maxCount={1}
            placeholder={t('entries.categoryPlaceholder')}
            options={categoryOptions}
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item name="date" label={t('entries.date')}>
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EntryForm;
