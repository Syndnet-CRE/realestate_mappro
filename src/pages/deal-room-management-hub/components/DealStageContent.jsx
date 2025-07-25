import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const DealStageContent = ({ deal, stage }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newComment, setNewComment] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Icon name="Briefcase" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No Deal Selected</h3>
          <p className="text-text-secondary">Select a deal from the pipeline to view details</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'LayoutDashboard' },
    { id: 'tasks', name: 'Tasks', icon: 'CheckSquare' },
    { id: 'documents', name: 'Documents', icon: 'FileText' },
    { id: 'comments', name: 'Comments', icon: 'MessageSquare' },
    { id: 'timeline', name: 'Timeline', icon: 'Clock' }
  ];

  const mockTasks = [
    {
      id: 1,
      title: 'Property Inspection Scheduled',
      description: 'Coordinate with property manager for access',
      assignee: 'Sarah Johnson',
      dueDate: '2025-07-15',
      priority: 'high',
      completed: false,
      category: 'due-diligence'
    },
    {
      id: 2,
      title: 'Financial Analysis Complete',
      description: 'Review cash flow projections and ROI calculations',
      assignee: 'Mike Chen',
      dueDate: '2025-07-12',
      priority: 'medium',
      completed: true,
      category: 'analysis'
    },
    {
      id: 3,
      title: 'Title Search Initiated',
      description: 'Order title report from preferred title company',
      assignee: 'Lisa Rodriguez',
      dueDate: '2025-07-18',
      priority: 'medium',
      completed: false,
      category: 'legal'
    }
  ];

  const mockDocuments = [
    {
      id: 1,
      name: 'Property_Inspection_Report.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadedBy: 'Sarah Johnson',
      uploadedDate: '2025-07-10',
      category: 'inspection'
    },
    {
      id: 2,
      name: 'Financial_Analysis_Spreadsheet.xlsx',
      type: 'Excel',
      size: '1.8 MB',
      uploadedBy: 'Mike Chen',
      uploadedDate: '2025-07-09',
      category: 'financial'
    },
    {
      id: 3,
      name: 'Property_Photos.zip',
      type: 'Archive',
      size: '15.2 MB',
      uploadedBy: 'David Kim',
      uploadedDate: '2025-07-08',
      category: 'media'
    }
  ];

  const mockComments = [
    {
      id: 1,
      author: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      content: 'Inspection completed. Found minor issues with HVAC system that need attention before closing.',
      timestamp: '2 hours ago',
      replies: []
    },
    {
      id: 2,
      author: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      content: 'Updated financial projections based on latest market data. ROI looks promising at current asking price.',
      timestamp: '4 hours ago',
      replies: [
        {
          id: 3,
          author: 'Lisa Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
          content: 'Great work on the analysis. Can you also factor in the renovation costs we discussed?',
          timestamp: '3 hours ago'
        }
      ]
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Deal Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Completion</span>
              <span className="text-sm font-medium text-text-primary">65%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">8</div>
                <div className="text-xs text-text-secondary">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">4</div>
                <div className="text-xs text-text-secondary">Pending</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Key Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Cap Rate</span>
              <span className="text-sm font-medium text-text-primary">7.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Cash-on-Cash</span>
              <span className="text-sm font-medium text-text-primary">12.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">IRR</span>
              <span className="text-sm font-medium text-text-primary">15.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Break-even</span>
              <span className="text-sm font-medium text-text-primary">18 months</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {mockComments.slice(0, 3).map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-text-primary">{comment.author}</span>
                  <span className="text-xs text-text-secondary">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-text-secondary mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Tasks</h3>
        <div className="flex items-center space-x-2">
          <select
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            className="text-sm border border-border rounded-md px-3 py-1"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
            Add Task
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {mockTasks.map((task) => (
          <div key={task.id} className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={task.completed}
                onChange={() => {}}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${task.completed ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'high' ? 'bg-error/10 text-error' :
                      task.priority === 'medium'? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>
                      {task.priority}
                    </span>
                    <Button variant="ghost" size="icon">
                      <Icon name="MoreHorizontal" size={16} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-text-secondary mt-1">{task.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-text-secondary">
                  <div className="flex items-center space-x-1">
                    <Icon name="User" size={12} />
                    <span>{task.assignee}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={12} />
                    <span>Due {task.dueDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Documents</h3>
        <Button variant="outline" iconName="Upload" iconPosition="left">
          Upload Documents
        </Button>
      </div>

      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <Icon name="Upload" size={32} className="text-text-secondary mx-auto mb-2" />
        <p className="text-text-secondary mb-2">Drag and drop files here, or click to browse</p>
        <p className="text-xs text-text-secondary">Supports PDF, DOC, XLS, images up to 10MB</p>
      </div>

      <div className="space-y-2">
        {mockDocuments.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="FileText" size={20} className="text-primary" />
              </div>
              <div>
                <div className="font-medium text-text-primary">{doc.name}</div>
                <div className="text-sm text-text-secondary">
                  {doc.size} • Uploaded by {doc.uploadedBy} on {doc.uploadedDate}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Icon name="Download" size={16} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="MoreHorizontal" size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComments = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Comments</h3>
      
      <div className="bg-surface border border-border rounded-lg p-4">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-3"
        />
        <div className="flex justify-end">
          <Button variant="outline" size="sm">
            Post Comment
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {mockComments.map((comment) => (
          <div key={comment.id} className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-text-primary">{comment.author}</span>
                  <span className="text-sm text-text-secondary">{comment.timestamp}</span>
                </div>
                <p className="text-text-secondary">{comment.content}</p>
                
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 ml-4 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="User" size={12} className="text-secondary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-text-primary text-sm">{reply.author}</span>
                            <span className="text-xs text-text-secondary">{reply.timestamp}</span>
                          </div>
                          <p className="text-sm text-text-secondary">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Timeline</h3>
      
      <div className="space-y-4">
        {[
          { date: '2025-07-11', time: '10:30 AM', event: 'Deal room created', user: 'John Analyst', type: 'created' },
          { date: '2025-07-10', time: '3:45 PM', event: 'Property inspection completed', user: 'Sarah Johnson', type: 'milestone' },
          { date: '2025-07-09', time: '11:20 AM', event: 'Financial analysis uploaded', user: 'Mike Chen', type: 'document' },
          { date: '2025-07-08', time: '2:15 PM', event: 'Initial offer submitted', user: 'Lisa Rodriguez', type: 'action' }
        ].map((item, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${
                item.type === 'created' ? 'bg-primary' :
                item.type === 'milestone' ? 'bg-success' :
                item.type === 'document'? 'bg-accent' : 'bg-warning'
              }`}></div>
              {index < 3 && <div className="w-px h-8 bg-border mt-2"></div>}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-text-primary">{item.event}</p>
                <span className="text-sm text-text-secondary">{item.time}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-text-secondary">by {item.user}</span>
                <span className="text-sm text-text-secondary">•</span>
                <span className="text-sm text-text-secondary">{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'tasks':
        return renderTasks();
      case 'documents':
        return renderDocuments();
      case 'comments':
        return renderComments();
      case 'timeline':
        return renderTimeline();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border">
        <div className="flex space-x-1 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-muted'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DealStageContent;