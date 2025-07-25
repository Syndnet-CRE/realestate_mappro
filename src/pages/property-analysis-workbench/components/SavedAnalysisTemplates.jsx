import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SavedAnalysisTemplates = ({ onTemplateSelect, onTemplateCreate }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');

  const mockTemplates = [
    {
      id: 1,
      name: "Residential Investment Analysis",
      description: "Standard template for single-family rental property evaluation",
      criteria: {
        minROI: 8,
        maxCapRate: 12,
        minCashFlow: 200,
        maxVacancy: 10
      },
      createdDate: "2024-06-15",
      lastUsed: "2024-07-10",
      useCount: 23,
      isDefault: true
    },
    {
      id: 2,
      name: "Fix & Flip Analysis",
      description: "Template for evaluating properties for renovation and resale",
      criteria: {
        minProfit: 50000,
        maxRenovationCost: 100000,
        maxHoldingPeriod: 6,
        minARV: 200000
      },
      createdDate: "2024-05-20",
      lastUsed: "2024-07-08",
      useCount: 15,
      isDefault: false
    },
    {
      id: 3,
      name: "Commercial Property Evaluation",
      description: "Analysis template for commercial real estate investments",
      criteria: {
        minCapRate: 6,
        maxLTV: 75,
        minNOI: 100000,
        maxVacancy: 15
      },
      createdDate: "2024-04-10",
      lastUsed: "2024-07-05",
      useCount: 8,
      isDefault: false
    },
    {
      id: 4,
      name: "Multi-Family Analysis",
      description: "Template for apartment buildings and multi-unit properties",
      criteria: {
        minUnits: 4,
        minCapRate: 7,
        maxCapRate: 15,
        minCashFlow: 500
      },
      createdDate: "2024-03-25",
      lastUsed: "2024-06-28",
      useCount: 12,
      isDefault: false
    }
  ];

  const [templates, setTemplates] = useState(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    onTemplateSelect?.(template);
  };

  const handleCreateTemplate = () => {
    if (newTemplateName.trim()) {
      const newTemplate = {
        id: templates.length + 1,
        name: newTemplateName,
        description: newTemplateDescription,
        criteria: {
          minROI: 8,
          maxCapRate: 12,
          minCashFlow: 200,
          maxVacancy: 10
        },
        createdDate: new Date().toISOString().split('T')[0],
        lastUsed: null,
        useCount: 0,
        isDefault: false
      };
      
      setTemplates([...templates, newTemplate]);
      onTemplateCreate?.(newTemplate);
      setShowCreateModal(false);
      setNewTemplateName('');
      setNewTemplateDescription('');
    }
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
    }
  };

  const handleDuplicateTemplate = (template) => {
    const duplicatedTemplate = {
      ...template,
      id: templates.length + 1,
      name: `${template.name} (Copy)`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUsed: null,
      useCount: 0,
      isDefault: false
    };
    
    setTemplates([...templates, duplicatedTemplate]);
  };

  return (
    <div className="bg-surface">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Analysis Templates</h3>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Icon name="Plus" size={16} />
            New Template
          </Button>
        </div>
      </div>

      {/* Templates List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ${
              selectedTemplate?.id === template.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-text-primary">{template.name}</h4>
                  {template.isDefault && (
                    <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                      Default
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                  {template.description}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-text-secondary">
                  <span className="flex items-center space-x-1">
                    <Icon name="Calendar" size={12} />
                    <span>Created {template.createdDate}</span>
                  </span>
                  
                  <span className="flex items-center space-x-1">
                    <Icon name="BarChart3" size={12} />
                    <span>Used {template.useCount} times</span>
                  </span>
                  
                  {template.lastUsed && (
                    <span className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} />
                      <span>Last used {template.lastUsed}</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 ml-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateTemplate(template);
                  }}
                >
                  <Icon name="Copy" size={14} />
                </Button>
                
                {!template.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-error hover:text-error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Create New Template</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCreateModal(false)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Template Name"
                type="text"
                placeholder="Enter template name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                required
              />
              
              <Input
                label="Description"
                type="text"
                placeholder="Describe the template purpose"
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleCreateTemplate}
                  disabled={!newTemplateName.trim()}
                >
                  Create Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Details */}
      {selectedTemplate && (
        <div className="border-t border-border p-4">
          <h4 className="text-sm font-medium text-text-primary mb-3">Template Criteria</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(selectedTemplate.criteria).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center text-xs">
                <span className="text-text-secondary capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="font-medium text-text-primary">
                  {typeof value === 'number' ? (key.includes('Rate') || key.includes('ROI') ? `${value}%` : 
                     key.includes('Cost') || key.includes('Profit') || key.includes('Flow') || key.includes('NOI') || key.includes('ARV') ? `$${value.toLocaleString()}` : 
                     key.includes('Period') ? `${value} months` :
                     key.includes('Units') ? `${value} units` : value) : 
                    value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedAnalysisTemplates;