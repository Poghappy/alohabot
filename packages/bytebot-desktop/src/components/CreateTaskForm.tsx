import React, { useState } from 'react';
import './CreateTaskForm.css';

interface CreateTaskFormProps {
    onCreateTask: (title: string, description: string) => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onCreateTask }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onCreateTask(title.trim(), description.trim());
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('创建任务失败:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-task-form">
            <h3>创建新任务</h3>

            <form onSubmit={handleSubmit} className="task-form">
                <div className="form-group">
                    <label htmlFor="task-title">任务标题</label>
                    <input
                        id="task-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="输入任务标题..."
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="task-description">任务描述</label>
                    <textarea
                        id="task-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="详细描述任务内容..."
                        rows={4}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <button
                    type="submit"
                    className="submit-button"
                    disabled={!title.trim() || !description.trim() || isSubmitting}
                >
                    {isSubmitting ? '创建中...' : '创建任务'}
                </button>
            </form>
        </div>
    );
};

export default CreateTaskForm;
