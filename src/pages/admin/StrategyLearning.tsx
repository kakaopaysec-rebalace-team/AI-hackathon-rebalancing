import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Globe, FileText, Bot, Sparkles, Clock, TrendingUp, Shield, Target, Trash2, Check, AlertTriangle, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import AdminNavigation from '@/components/admin/AdminNavigation';

const StrategyLearning = () => {
  // 각 탭별 입력 상태
  const [customInput, setCustomInput] = useState('');
  const [customStrategyName, setCustomStrategyName] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlStrategyName, setUrlStrategyName] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documentStrategyName, setDocumentStrategyName] = useState('');
  const [autoStrategyName, setAutoStrategyName] = useState('');
  const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({});

  // 생성된 전략 목록 상태
  const [strategies, setStrategies] = useState([]);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(true);
  
  // 체크박스 및 삭제 관련 상태
  const [selectedStrategies, setSelectedStrategies] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 전략 적용 관련 상태
  const [isApplying, setIsApplying] = useState<{ [key: string]: boolean }>({});

  // 전략 목록 조회
  const fetchStrategies = async () => {
    try {
      setIsLoadingStrategies(true);
      const response = await fetch('http://localhost:3001/api/strategy-learning/strategies');
      const data = await response.json();
      
      if (data.success) {
        setStrategies(data.data);
      } else {
        toast.error('전략 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('전략 목록 조회 오류:', error);
      toast.error('서버 연결에 실패했습니다.');
    } finally {
      setIsLoadingStrategies(false);
    }
  };

  // 컴포넌트 마운트 시 전략 목록 조회
  useEffect(() => {
    fetchStrategies();
  }, []);

  // 전략 타입별 배지 색상
  const getStrategyBadgeColor = (type: string) => {
    switch (type) {
      case 'USR': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'AUTO': return 'bg-green-100 text-green-800 border-green-300';
      case 'WEB': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'DOC': return 'bg-orange-100 text-orange-800 border-orange-300';
      // 기존 타입들도 호환성을 위해 유지
      case 'CST': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FAI': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // 위험도별 배지 색상
  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case '고위험': return 'bg-red-100 text-red-800 border-red-300';
      case '중위험': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case '저위험': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // 투자스타일별 아이콘
  const getStyleIcon = (style: string) => {
    switch (style) {
      case '성장투자': return TrendingUp;
      case '가치투자': return Target;
      case '배당투자': return Shield;
      case '모멘텀투자': return TrendingUp;
      default: return Target;
    }
  };

  // 사용자 입력 전략 생성
  const handleCustomStrategyGenerate = async () => {
    if (!customStrategyName.trim()) {
      toast.error('전략명을 입력해주세요.');
      return;
    }
    if (!customInput.trim()) {
      toast.error('전략 내용을 입력해주세요.');
      return;
    }

    setIsGenerating({ custom: true });
    toast.success('전략 생성을 시작합니다. AI가 입력 내용을 분석하여 포트폴리오 전략을 생성합니다.');
    
    try {
      const response = await fetch('http://localhost:3001/api/strategy-learning/generate/user-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          strategyName: customStrategyName,
          userInput: customInput
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCustomInput('');
        setCustomStrategyName('');
        toast.success('USR 전략이 성공적으로 생성되었습니다.');
        await fetchStrategies(); // 전략 목록 새로고침
      } else {
        toast.error('전략 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('전략 생성 오류:', error);
      toast.error('서버 연결에 실패했습니다.');
    } finally {
      setIsGenerating({ custom: false });
    }
  };

  // URL 기반 전략 생성
  const handleUrlStrategyGenerate = async () => {
    if (!urlStrategyName.trim()) {
      toast.error('전략명을 입력해주세요.');
      return;
    }
    if (!urlInput.trim()) {
      toast.error('웹사이트 URL을 입력해주세요.');
      return;
    }

    // URL 유효성 검사
    try {
      new URL(urlInput);
    } catch {
      toast.error('올바른 URL 형식을 입력해주세요.');
      return;
    }

    setIsGenerating({ url: true });
    toast.success('웹사이트 분석을 시작합니다. AI가 해당 사이트의 투자 정보를 학습합니다.');
    
    try {
      const response = await fetch('http://localhost:3001/api/strategy-learning/generate/website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          strategyName: urlStrategyName,
          url: urlInput
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setUrlInput('');
        setUrlStrategyName('');
        toast.success('WEB 전략이 성공적으로 생성되었습니다.');
        await fetchStrategies(); // 전략 목록 새로고침
      } else {
        toast.error('전략 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('전략 생성 오류:', error);
      toast.error('서버 연결에 실패했습니다.');
    } finally {
      setIsGenerating({ url: false });
    }
  };

  // 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validTypes = ['.pdf', '.txt', '.doc', '.docx', '.ppt', '.pptx'];
    
    const validFiles = files.filter(file => {
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      return validTypes.includes(extension);
    });

    if (validFiles.length !== files.length) {
      toast.error('지원하지 않는 파일 형식이 포함되어 있습니다.');
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  // 문서 기반 전략 생성
  const handleDocumentStrategyGenerate = async () => {
    if (!documentStrategyName.trim()) {
      toast.error('전략명을 입력해주세요.');
      return;
    }
    if (uploadedFiles.length === 0) {
      toast.error('문서 파일을 업로드해주세요.');
      return;
    }

    setIsGenerating({ document: true });
    toast.success('문서 분석을 시작합니다. AI가 업로드된 파일들을 학습합니다.');
    
    try {
      // FormData를 사용하여 파일 업로드
      const formData = new FormData();
      formData.append('strategyName', documentStrategyName);
      uploadedFiles.forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await fetch('http://localhost:3001/api/strategy-learning/generate/document', {
        method: 'POST',
        body: formData // multipart/form-data로 자동 설정됨
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadedFiles([]);
        setDocumentStrategyName('');
        toast.success('DOC 전략이 성공적으로 생성되었습니다.');
        await fetchStrategies(); // 전략 목록 새로고침
      } else {
        toast.error('전략 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('전략 생성 오류:', error);
      toast.error('서버 연결에 실패했습니다.');
    } finally {
      setIsGenerating({ document: false });
    }
  };

  // 파일 제거
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };


  // 자동 전략 생성
  const handleAutoStrategyGenerate = async () => {
    if (!autoStrategyName.trim()) {
      toast.error('전략명을 입력해주세요.');
      return;
    }

    setIsGenerating({ auto: true });
    toast.success('자동 전략 생성을 시작합니다. AI가 시장 분석을 통해 전략을 생성합니다.');
    
    try {
      const response = await fetch('http://localhost:3001/api/strategy-learning/generate/auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          strategyName: autoStrategyName
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAutoStrategyName('');
        toast.success('AUTO 전략이 성공적으로 생성되었습니다.');
        await fetchStrategies(); // 전략 목록 새로고침
      } else {
        toast.error('전략 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('전략 생성 오류:', error);
      toast.error('서버 연결에 실패했습니다.');
    } finally {
      setIsGenerating({ auto: false });
    }
  };

  // 체크박스 관련 함수들
  const handleSelectStrategy = (strategyCode: string, checked: boolean) => {
    const newSelected = new Set(selectedStrategies);
    if (checked) {
      newSelected.add(strategyCode);
    } else {
      newSelected.delete(strategyCode);
    }
    setSelectedStrategies(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStrategies(new Set(strategies.map((strategy: any) => strategy.strategy_code)));
    } else {
      setSelectedStrategies(new Set());
    }
  };

  // 전략 삭제 함수
  const handleDeleteStrategies = async () => {
    setIsDeleting(true);
    try {
      const strategyCodes = Array.from(selectedStrategies);
      const response = await fetch('http://localhost:3001/api/strategy-learning/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategyCodes: strategyCodes
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`${result.data.deletedCount}개의 전략이 삭제되었습니다.`);
        setSelectedStrategies(new Set());
        await fetchStrategies(); // 목록 새로고침
      } else {
        toast.error(result.message || '전략 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('전략 삭제 오류:', error);
      toast.error('서버 연결에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 전략 적용 함수
  const handleApplyStrategy = async (strategyCode: string) => {
    setIsApplying(prev => ({ ...prev, [strategyCode]: true }));
    try {
      const response = await fetch(`http://localhost:3001/api/strategy-learning/apply/${strategyCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('전략이 성공적으로 적용되었습니다.');
        await fetchStrategies(); // 목록 새로고침
      } else {
        toast.error(result.message || '전략 적용에 실패했습니다.');
      }
    } catch (error) {
      console.error('전략 적용 오류:', error);
      toast.error('서버 연결에 실패했습니다.');
    } finally {
      setIsApplying(prev => ({ ...prev, [strategyCode]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 관리자 네비게이션 */}
        <AdminNavigation />

        {/* 전략 생성 탭 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  전략 생성
                </CardTitle>
                <CardDescription>
                  다양한 방법으로 AI 기반 포트폴리오 전략을 생성할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="custom" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="custom">사용자 입력</TabsTrigger>
                    <TabsTrigger value="url">웹사이트</TabsTrigger>
                    <TabsTrigger value="document">문서</TabsTrigger>
                    <TabsTrigger value="auto">자동생성</TabsTrigger>
                  </TabsList>

                  {/* 사용자 입력 기반 전략 생성 (USR) */}
                  <TabsContent value="custom" className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getStrategyBadgeColor('USR')}>USR</Badge>
                      <span className="text-sm text-gray-600">User Input Strategy</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="custom-strategy-name">전략명</Label>
                        <Input
                          id="custom-strategy-name"
                          placeholder="예: 성장형 IT 집중 전략"
                          value={customStrategyName}
                          onChange={(e) => setCustomStrategyName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom-input">투자 전략 입력</Label>
                        <Textarea
                          id="custom-input"
                          placeholder="투자 전략을 자세히 설명해주세요. 예: 국내 대형주 중심으로 IT, 바이오, 화학 섹터에 분산투자하는 안정적인 성장 전략을 원합니다..."
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          rows={6}
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        onClick={handleCustomStrategyGenerate}
                        disabled={isGenerating.custom}
                        className="w-full"
                      >
                        {isGenerating.custom ? (
                          <>
                            <Bot className="w-4 h-4 mr-2 animate-spin" />
                            AI가 전략을 생성하고 있습니다...
                          </>
                        ) : (
                          <>
                            <Bot className="w-4 h-4 mr-2" />
                            AI 전략 생성
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* 웹사이트 기반 전략 생성 (WEB) */}
                  <TabsContent value="url" className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getStrategyBadgeColor('WEB')}>WEB</Badge>
                      <span className="text-sm text-gray-600">Website Analysis Strategy</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="url-strategy-name">전략명</Label>
                        <Input
                          id="url-strategy-name"
                          placeholder="예: 야후 파이낸스 기반 전략"
                          value={urlStrategyName}
                          onChange={(e) => setUrlStrategyName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="url-input">웹사이트 URL</Label>
                        <Input
                          id="url-input"
                          type="url"
                          placeholder="https://example.com/investment-strategy"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          투자 관련 웹사이트 URL을 입력하면 AI가 해당 내용을 분석하여 전략을 생성합니다
                        </p>
                      </div>
                      <Button 
                        onClick={handleUrlStrategyGenerate}
                        disabled={isGenerating.url}
                        className="w-full"
                      >
                        {isGenerating.url ? (
                          <>
                            <Globe className="w-4 h-4 mr-2 animate-spin" />
                            웹사이트를 분석하고 있습니다...
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4 mr-2" />
                            웹사이트 분석 및 전략 생성
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* 문서 기반 전략 생성 (DOC) */}
                  <TabsContent value="document" className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getStrategyBadgeColor('DOC')}>DOC</Badge>
                      <span className="text-sm text-gray-600">Document-based Strategy</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="document-strategy-name">전략명</Label>
                        <Input
                          id="document-strategy-name"
                          placeholder="예: 투자보고서 기반 전략"
                          value={documentStrategyName}
                          onChange={(e) => setDocumentStrategyName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="file-upload">문서 파일 업로드</Label>
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".pdf,.txt,.doc,.docx,.ppt,.pptx"
                          onChange={handleFileUpload}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          지원 형식: PDF, TXT, DOC, DOCX, PPT, PPTX
                        </p>
                      </div>

                      {/* 업로드된 파일 목록 */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <Label>업로드된 파일</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  제거
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button 
                        onClick={handleDocumentStrategyGenerate}
                        disabled={isGenerating.document || uploadedFiles.length === 0 || !documentStrategyName.trim()}
                        className="w-full"
                      >
                        {isGenerating.document ? (
                          <>
                            <Upload className="w-4 h-4 mr-2 animate-spin" />
                            문서를 분석하고 있습니다...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            문서 분석 및 전략 생성
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* 자동 생성 설정 (AUTO) */}
                  <TabsContent value="auto" className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getStrategyBadgeColor('AUTO')}>AUTO</Badge>
                      <span className="text-sm text-gray-600">Automated Strategy Generation</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-blue-900">자동 전략 생성</h3>
                        </div>
                        <p className="text-blue-800 text-sm">
                          AI가 매일 자동으로 시장 분석을 수행하여 새로운 투자 전략을 생성합니다.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{strategies.filter(s => s.type === 'AUTO' && new Date(s.created_at).toDateString() === new Date().toDateString()).length}</div>
                            <div className="text-sm text-gray-600">오늘 생성된 전략</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{strategies.filter(s => s.type === 'AUTO').length}</div>
                            <div className="text-sm text-gray-600">전체 AUTO 전략</div>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <Label htmlFor="auto-strategy-name">전략명</Label>
                        <Input
                          id="auto-strategy-name"
                          placeholder="예: AI 자동생성 전략"
                          value={autoStrategyName}
                          onChange={(e) => setAutoStrategyName(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">다음 자동 생성 예정</h4>
                        <p className="text-sm text-gray-600">내일 오전 9시에 새로운 AUTO 전략이 자동 생성됩니다.</p>
                      </div>

                      <Button 
                        onClick={handleAutoStrategyGenerate}
                        disabled={isGenerating.auto || !autoStrategyName.trim()}
                        className="w-full"
                      >
                        {isGenerating.auto ? (
                          <>
                            <Bot className="w-4 h-4 mr-2 animate-spin" />
                            AI가 자동 전략을 생성하고 있습니다...
                          </>
                        ) : (
                          <>
                            <Bot className="w-4 h-4 mr-2" />
                            지금 자동 전략 생성
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* 전략 생성 현황 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>생성 현황</CardTitle>
                <CardDescription>전략 타입별 생성 통계</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className={getStrategyBadgeColor('USR')}>USR</Badge>
                      <span className="text-sm">사용자 입력</span>
                    </div>
                    <span className="font-semibold">{strategies.filter(s => s.type === 'USR').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className={getStrategyBadgeColor('AUTO')}>AUTO</Badge>
                      <span className="text-sm">자동 생성</span>
                    </div>
                    <span className="font-semibold">{strategies.filter(s => s.type === 'AUTO').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className={getStrategyBadgeColor('WEB')}>WEB</Badge>
                      <span className="text-sm">웹사이트</span>
                    </div>
                    <span className="font-semibold">{strategies.filter(s => s.type === 'WEB').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className={getStrategyBadgeColor('DOC')}>DOC</Badge>
                      <span className="text-sm">문서</span>
                    </div>
                    <span className="font-semibold">{strategies.filter(s => s.type === 'DOC').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 생성된 전략 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>생성된 전략 목록</CardTitle>
                <CardDescription>최근 생성된 포트폴리오 전략들을 확인할 수 있습니다</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                {selectedStrategies.size > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {selectedStrategies.size}개 선택됨
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          disabled={isDeleting}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 shadow-md font-medium"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          선택 삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold text-red-600">
                            <Trash2 className="w-6 h-6 inline mr-2" />
                            전략 삭제 확인
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-base">
                            선택한 <span className="font-bold text-blue-600">{selectedStrategies.size}개</span>의 전략을 삭제하시겠습니까?
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-amber-800">주의사항</div>
                                  <div className="text-sm text-amber-700 mt-1">
                                    이 작업은 되돌릴 수 없습니다.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteStrategies}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                삭제 중...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                삭제
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    선택 삭제
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedStrategies.size === strategies.length && strategies.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">전체 선택</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStrategies ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">전략 목록을 불러오는 중...</p>
                </div>
              </div>
            ) : strategies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">아직 생성된 전략이 없습니다.</p>
                <p className="text-sm text-gray-500">위의 탭에서 AI 전략을 생성해보세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {strategies.map((strategy) => {
                  const StyleIcon = getStyleIcon(strategy.investment_style);
                  const isSelected = selectedStrategies.has(strategy.strategy_code);
                  
                  return (
                    <div 
                      key={strategy.strategy_code} 
                      className={`border rounded-lg transition-all duration-200 hover:shadow-lg ${
                        isSelected ? 'border-blue-400 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => 
                                handleSelectStrategy(strategy.strategy_code, checked as boolean)
                              }
                            />
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                              <StyleIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{strategy.strategy_name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStrategyBadgeColor(strategy.type)}>
                              {strategy.type}
                            </Badge>
                            <Badge variant={strategy.status === '적용됨' ? 'default' : strategy.status === '완료' ? 'secondary' : 'outline'}>
                              {strategy.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">위험도:</span>
                            <Badge className={getRiskBadgeColor(strategy.risk_level)}>
                              {strategy.risk_level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">투자스타일:</span>
                            <span className="text-sm text-gray-600">{strategy.investment_style}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">생성일:</span>
                            <span className="text-sm text-gray-500">{strategy.createdAt}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">키워드:</span>
                            <div className="flex gap-2">
                              {strategy.keyword1 && (
                                <Badge variant="outline" className="text-xs">
                                  #{strategy.keyword1}
                                </Badge>
                              )}
                              {strategy.keyword2 && (
                                <Badge variant="outline" className="text-xs">
                                  #{strategy.keyword2}
                                </Badge>
                              )}
                              {strategy.keyword3 && (
                                <Badge variant="outline" className="text-xs">
                                  #{strategy.keyword3}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {strategy.is_applied === 'N' && (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleApplyStrategy(strategy.strategy_code)}
                                disabled={isApplying[strategy.strategy_code]}
                                className="bg-green-600 hover:bg-green-700 shadow-md font-medium"
                              >
                                {isApplying[strategy.strategy_code] ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    적용 중...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    전략 적용
                                  </>
                                )}
                              </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/admin/strategy-detail/${strategy.strategy_code}`}>
                                상세보기
                              </Link>
                            </Button>
                            {strategy.is_applied === 'Y' && (
                              <Badge variant="default" className="px-3 py-1 bg-green-100 text-green-800 border-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                적용완료
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StrategyLearning;