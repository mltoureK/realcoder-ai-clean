import React, {useState } from 'react';
import GenerateControls from './components/GenerateControls';
import CodeEditor from './components/CodeEditor';

interface GeneratedFiles{
    [filename: string]: string;
}

export default function App() {
    const [message, setMessage] = useState('');
    const [language, setLanguage] = useState('JavaScript');
    const [namingConvention, setNamingConvention] = useState('camelCase');
    const [commentStyle, setCommentStyle] = useState('minimal');
    const [codeComplexity, setCodeComplexity] = useState('beginner');
    const [includeErrorHandling, setIncludeErrorHandling] = useState(false);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<GeneratedFiles>({});
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [code, setCode] = useState('');

    const handleChange = (field: string, value: string | boolean) => {
        switch (field) {
            case 'message':setMessage(value as string);break;
            case 'language':setLanguage(value as string);break;
            case 'namingConvention':setNamingConvention(value as string);break;
            case 'commentStyle':setCommentStyle(value as string);break;
            case 'codeComplexity':setCodeComplexity(value as string);break;
            case 'includeErrorHandling':setIncludeErrorHandling(value as boolean);break;
        }
    };

    const onGenerateCode = async () => {
        setLoading(true);
        try{
            const res = await fetch('/sendSMS', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    language,
                    namingConvention,
                    commentStyle,
                    errorHandling: includeErrorHandling ? 'include proper error handling' : 'no error handling needed',
                    codeComplexity
                }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setFiles(data.files);
            const first = Object.keys(data.files)[0] || '';
            setSelectedFile(first);
            setCode(data.files[first] || '');
        }catch (err: any){
            alert(err.message || 'Failed to generate code');
        } finally {
            setLoading(false);
        }
        setLoading(false);
    };

    const onGenerateQuiz = async () => {
        setLoading(true);
        try {
            const res = await fetch('/generateQuiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    language,
                    message
                }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            console.log('Quiz cards:', data.quizCards);
            // TODO: render quiz cards in a QuizGrid component
        }catch (err: any) {
            alert(err.message || 'Failed to generate quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl bg-zinc-800 rounded-xl shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-4 text-center text-white">💻 RealCoder.AI</h1>
            <GenerateControls
                message={message}
                language={language}
                namingConvention={namingConvention}
                commentStyle={commentStyle}
                codeComplexity={codeComplexity}
                includeErrorHandling={includeErrorHandling}
                onChange={handleChange}
                onGenerateCode={onGenerateCode}
                onGenerateQuiz={onGenerateQuiz}
                loading={loading}
            />

            {/* {Code editor with tabs above} */}
                <div className="flex space-x-2 mb-4">
                    {Object.keys(files).map((name) => (
                        <button
                            key={name}
                            onClick={() => {setSelectedFile(name); setCode(files[name]); }}
                            className={` px-3 py-1 rounded ${selectedFile === name ? 'bg-cyan-500 text-black' : 'bg-zinc-600 text-white'}`}
                            > {name}</button>
                    ))}
                </div>
                <CodeEditor mode={language.toLowerCase()} value={code} onChange={setCode} />
            
            {/* QuizGrid goes here */}
        </div>
    );
}



