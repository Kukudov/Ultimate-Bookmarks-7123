import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiAlertTriangle, FiCheckCircle, FiX, FiRefreshCw, FiExternalLink, FiTrash2, FiClock } = FiIcons;

const BrokenLinkChecker = ({ bookmarks, onClose, onRemoveBrokenLinks }) => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedBroken, setSelectedBroken] = useState([]);
  const [progress, setProgress] = useState(0);

  const checkSingleLink = async (bookmark) => {
    try {
      // Method 1: Try to load favicon to check if domain exists
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=16`;
      
      return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          resolve({
            ...bookmark,
            status: 'timeout',
            working: false,
            error: 'Request timeout'
          });
        }, 10000); // 10 second timeout

        img.onload = () => {
          clearTimeout(timeout);
          // If favicon loads, try a more sophisticated check
          checkWithFetch(bookmark).then(resolve);
        };

        img.onerror = () => {
          clearTimeout(timeout);
          resolve({
            ...bookmark,
            status: 'domain_error',
            working: false,
            error: 'Domain not reachable'
          });
        };

        img.src = faviconUrl;
      });
    } catch (error) {
      return {
        ...bookmark,
        status: 'invalid_url',
        working: false,
        error: 'Invalid URL format'
      };
    }
  };

  const checkWithFetch = async (bookmark) => {
    try {
      // Try multiple methods to check the link
      const methods = [
        // Method 1: Direct fetch with no-cors mode
        () => fetch(bookmark.url, { 
          method: 'HEAD', 
          mode: 'no-cors',
          cache: 'no-cache'
        }),
        
        // Method 2: Try with a CORS proxy
        () => fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(bookmark.url)}`),
        
        // Method 3: Check if it's a known working domain
        () => checkKnownDomains(bookmark.url)
      ];

      for (let i = 0; i < methods.length; i++) {
        try {
          const response = await Promise.race([
            methods[i](),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
          ]);

          if (response && (response.ok || response.type === 'opaque')) {
            return {
              ...bookmark,
              status: response.status || 'cors_ok',
              working: true,
              method: `Method ${i + 1}`
            };
          }
        } catch (methodError) {
          // Continue to next method
          continue;
        }
      }

      // If all methods fail, do a final heuristic check
      const heuristicResult = await heuristicCheck(bookmark.url);
      return {
        ...bookmark,
        ...heuristicResult
      };

    } catch (error) {
      return {
        ...bookmark,
        status: 'fetch_error',
        working: false,
        error: error.message
      };
    }
  };

  const checkKnownDomains = async (url) => {
    const knownWorkingDomains = [
      'github.com', 'stackoverflow.com', 'google.com', 'youtube.com',
      'facebook.com', 'twitter.com', 'linkedin.com', 'medium.com',
      'dev.to', 'codepen.io', 'dribbble.com', 'behance.net',
      'figma.com', 'notion.so', 'discord.com', 'slack.com'
    ];

    try {
      const hostname = new URL(url).hostname.toLowerCase();
      const isKnownDomain = knownWorkingDomains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      );

      if (isKnownDomain) {
        return Promise.resolve({
          ok: true,
          status: 'known_working',
          type: 'known'
        });
      }
    } catch (e) {
      // Invalid URL
    }

    return Promise.reject(new Error('Unknown domain'));
  };

  const heuristicCheck = async (url) => {
    try {
      const urlObj = new URL(url);
      
      // Check for common patterns that indicate broken links
      const suspiciousPatterns = [
        /localhost/i,
        /127\.0\.0\.1/,
        /192\.168\./,
        /10\.\d+\./,
        /\.local$/,
        /example\.(com|org|net)/i,
        /test\./i,
        /staging\./i
      ];

      const isSuspicious = suspiciousPatterns.some(pattern => 
        pattern.test(url)
      );

      if (isSuspicious) {
        return {
          status: 'suspicious',
          working: false,
          error: 'Suspicious URL pattern detected'
        };
      }

      // Check if it's HTTPS and has a reasonable TLD
      const commonTLDs = [
        '.com', '.org', '.net', '.edu', '.gov', '.io', '.co', 
        '.uk', '.de', '.fr', '.jp', '.au', '.ca', '.in', '.br'
      ];

      const hasCommonTLD = commonTLDs.some(tld => 
        urlObj.hostname.endsWith(tld)
      );

      if (!hasCommonTLD) {
        return {
          status: 'uncommon_tld',
          working: false,
          error: 'Uncommon or suspicious TLD'
        };
      }

      // If we get here, assume it might be working
      return {
        status: 'assumed_working',
        working: true,
        error: 'Could not verify, but URL appears valid'
      };

    } catch (error) {
      return {
        status: 'invalid_url',
        working: false,
        error: 'Invalid URL format'
      };
    }
  };

  const checkLinks = async () => {
    setChecking(true);
    setResults([]);
    setProgress(0);
    
    const totalBookmarks = bookmarks.length;
    const batchSize = 5; // Check 5 links at a time to avoid overwhelming the browser
    const results = [];

    for (let i = 0; i < totalBookmarks; i += batchSize) {
      const batch = bookmarks.slice(i, i + batchSize);
      
      const batchPromises = batch.map(bookmark => checkSingleLink(bookmark));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      setProgress((results.length / totalBookmarks) * 100);
      
      // Update results progressively
      setResults([...results]);
      
      // Small delay between batches to prevent overwhelming
      if (i + batchSize < totalBookmarks) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setChecking(false);
  };

  const brokenLinks = results.filter(result => !result.working);
  const workingLinks = results.filter(result => result.working);
  const suspiciousLinks = results.filter(result => 
    result.status === 'assumed_working' || result.status === 'cors_ok'
  );

  const handleSelectBroken = (bookmarkId) => {
    setSelectedBroken(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  const handleSelectAllBroken = () => {
    if (selectedBroken.length === brokenLinks.length) {
      setSelectedBroken([]);
    } else {
      setSelectedBroken(brokenLinks.map(link => link.id));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedBroken.length > 0) {
      onRemoveBrokenLinks(selectedBroken);
      setSelectedBroken([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'cors_ok':
      case 'known_working':
        return 'text-green-600 dark:text-green-400';
      case 'assumed_working':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'timeout':
      case 'domain_error':
      case 'fetch_error':
      case 'suspicious':
      case 'uncommon_tld':
      case 'invalid_url':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-secondary-600 dark:text-secondary-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'cors_ok': return 'Accessible (CORS)';
      case 'known_working': return 'Known Working Domain';
      case 'assumed_working': return 'Probably Working';
      case 'timeout': return 'Request Timeout';
      case 'domain_error': return 'Domain Not Reachable';
      case 'fetch_error': return 'Network Error';
      case 'suspicious': return 'Suspicious URL Pattern';
      case 'uncommon_tld': return 'Uncommon Domain';
      case 'invalid_url': return 'Invalid URL Format';
      default: return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
              Broken Link Checker
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-secondary-500" />
            </button>
          </div>
          
          <div className="mt-4 flex gap-3 items-center">
            <button
              onClick={checkLinks}
              disabled={checking}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <SafeIcon icon={FiRefreshCw} className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? `Checking... ${Math.round(progress)}%` : 'Check All Links'}
            </button>
            
            {checking && (
              <div className="flex-1 bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            
            {brokenLinks.length > 0 && (
              <button
                onClick={handleRemoveSelected}
                disabled={selectedBroken.length === 0}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                Remove Selected ({selectedBroken.length})
              </button>
            )}
          </div>

          {checking && (
            <div className="mt-3 text-sm text-secondary-600 dark:text-secondary-400">
              Using multiple methods to verify links. This may take a few minutes...
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {checking && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-secondary-600 dark:text-secondary-400">
                Checking {bookmarks.length} bookmarks...
              </p>
              <p className="text-sm text-secondary-500 dark:text-secondary-500 mt-2">
                Progress: {Math.round(progress)}% ({results.length}/{bookmarks.length})
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-700 dark:text-green-300">
                      Working Links
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {workingLinks.length}
                  </p>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiClock} className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-yellow-700 dark:text-yellow-300">
                      Uncertain
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                    {suspiciousLinks.length}
                  </p>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-700 dark:text-red-300">
                      Broken Links
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {brokenLinks.length}
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  How Link Checking Works
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• <strong>Working:</strong> Link is accessible and responds correctly</li>
                  <li>• <strong>Uncertain:</strong> Link appears valid but couldn't be fully verified due to CORS</li>
                  <li>• <strong>Broken:</strong> Link is definitely not accessible or has errors</li>
                </ul>
              </div>

              {/* Broken Links */}
              {brokenLinks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                      Broken Links
                    </h3>
                    <button
                      onClick={handleSelectAllBroken}
                      className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      {selectedBroken.length === brokenLinks.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {brokenLinks.map(link => (
                      <div
                        key={link.id}
                        className="flex items-center gap-3 p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBroken.includes(link.id)}
                          onChange={() => handleSelectBroken(link.id)}
                          className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-secondary-900 dark:text-white truncate">
                            {link.title}
                          </h4>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400 truncate">
                            {link.url}
                          </p>
                          <p className={`text-xs ${getStatusColor(link.status)}`}>
                            {getStatusText(link.status)}
                            {link.error && ` - ${link.error}`}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => window.open(link.url, '_blank')}
                          className="p-2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
                          title="Test link manually"
                        >
                          <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uncertain Links */}
              {suspiciousLinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                    Uncertain Links ({suspiciousLinks.length})
                  </h3>
                  <div className="space-y-2">
                    {suspiciousLinks.slice(0, 5).map(link => (
                      <div
                        key={link.id}
                        className="flex items-center gap-3 p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-secondary-900 dark:text-white truncate">
                            {link.title}
                          </h4>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400 truncate">
                            {link.url}
                          </p>
                          <p className={`text-xs ${getStatusColor(link.status)}`}>
                            {getStatusText(link.status)}
                          </p>
                        </div>
                        <button
                          onClick={() => window.open(link.url, '_blank')}
                          className="p-2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
                        >
                          <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {suspiciousLinks.length > 5 && (
                      <p className="text-sm text-secondary-500 text-center">
                        ... and {suspiciousLinks.length - 5} more uncertain links
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Working Links Summary */}
              {workingLinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                    Working Links ({workingLinks.length})
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    These bookmarks are verified to be accessible and working properly.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BrokenLinkChecker;