import React, {useState } from 'react';
import GenerateControls from './components/GenerateControls';

export default function App() {
    const [message, setMessage] = useState('');
    const [language, setLanguage] = useState('JavaScript');
    const [namingConvention, setNamingConvention] = useState('camelCase');
    const [commentStyle, setCommentStyle] = useState('minimal');
    const [codeComplexity, setCodeComplexity] = useState('beginner');
    const [includeErrorHandling, setIncludeErrorHandling] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (field: string, value: string | boolean) => {
        switch (field) {
            case 'message':
                setMessage(value as string);
                break;
            case 'language':
                setLanguage(value as string);
                break;
            case 'namingConvention':
                setNamingConvention(value as string);
                break;
            case 'commentStyle':
                setCommentStyle(value as string);
                break;
            case 'codeComplexity':
                setCodeComplexity(value as string);
                break;
            case 'includeErrorHandling':
                setIncludeErrorHandling(value as boolean);
                break;
        }
    };

    const onGenerateCode = () => {
        setLoading(true);
        // TODO: call API
    };

    const onGenerateQuiz = () => {
        setLoading(true);
        // TODO: call API
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
            {/* EditorPane and QuizGrid go here */}
        </div>
    );
}



