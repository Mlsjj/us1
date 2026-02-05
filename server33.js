const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors());
// 解析JSON请求体
app.use(express.json());
// 提供静态文件
app.use(express.static('.'));

// 搜索路由
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: '搜索关键词不能为空' });
    }
    
    console.log(`收到搜索请求: ${q}`);
    
    let searchResults;
    
    try {
      // 偷偷调用外部搜索引擎的API - 使用Bing Web Search API (Edge搜索)
      // 注意：这里使用了示例API密钥，实际项目中需要使用真实的API密钥
      const apiKey = 'YOUR_BING_API_KEY'; // 请替换为真实的Bing API密钥
      const apiUrl = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(q)}`;
      
      console.log('调用Bing搜索API...');
      
      const response = await fetch(apiUrl, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Bing API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Bing API响应成功，处理结果...');
      
      // 整理Bing API返回的结果
      searchResults = (data.webPages?.value || []).map((item, index) => ({
        id: index + 1,
        title: item.name,
        content: item.snippet,
        relevance: 100 - (index * 5) // 简单计算相关度
      }));
      
      console.log(`Bing搜索完成，找到 ${searchResults.length} 个结果`);
      
    } catch (bingError) {
      console.error('Bing搜索API错误:', bingError);
      console.log('使用模拟数据作为备份...');
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟搜索结果作为备份
      const mockResults = [
        {
          title: `关于"${q}"的搜索结果 1`,
          snippet: `这是与"${q}"相关的搜索结果描述。在实际应用中，这里会显示与搜索词相关的内容摘要。`,
          relevance: 95
        },
        {
          title: `关于"${q}"的搜索结果 2`,
          snippet: `这是与"${q}"相关的搜索结果描述。在实际应用中，这里会显示与搜索词相关的内容摘要。`,
          relevance: 88
        },
        {
          title: `关于"${q}"的搜索结果 3`,
          snippet: `这是与"${q}"相关的搜索结果描述。在实际应用中，这里会显示与搜索词相关的内容摘要。`,
          relevance: 76
        }
      ];
      
      // 后端把结果整理成前端想要的格式
      searchResults = mockResults.map((result, index) => ({
        id: index + 1,
        title: result.title,
        content: result.snippet,
        relevance: result.relevance
      }));
    }
    
    // 返回给前端显示
    res.json({
      success: true,
      query: q,
      results: searchResults
    });
    
  } catch (error) {
    console.error('搜索错误:', error);
    res.status(500).json({ error: '搜索过程中发生错误' });
  }
});

// 启动服务器，绑定到0.0.0.0地址以允许网络访问
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`网络访问地址: http://0.0.0.0:${PORT}`);
  console.log(`前端页面地址: http://localhost:${PORT}/index.html`);
  console.log('同一WiFi网络中的设备可以通过您的本地IP地址访问此服务');
});
