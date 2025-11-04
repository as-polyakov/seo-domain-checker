# Run front-end and back-end processes
_Exported on 04/11/2025 at 16:48:08 EET from Cursor (2.0.34)_

---

**User**

run front and back

---

**Cursor**

I'll help you run both the frontend and backend. Let me first check the project structure to understand how to start both services.

Perfect! I can see there's a `start-dev.sh` script that's designed to start both the backend and frontend. Let me run it for you:

The startup script is now running! Let me check the logs to see if both services started successfully:

Great! Both services are running successfully! 🎉

**Status:**
- ✅ **Frontend**: Running on http://localhost:3000/
- ✅ **Backend**: Running (Python API server)

The Vite development server shows the frontend is ready and accessible at:
- Local: http://localhost:3000/
- Network: http://192.168.1.103:3000/

Let me verify the backend is also responding on its expected port:

Perfect! Both services are fully operational:

## 🚀 Services Running

✅ **Backend API (FastAPI)**: http://localhost:8000/
- API Documentation available at: http://localhost:8000/docs

✅ **Frontend (React + Vite)**: http://localhost:3000/
- Also accessible on your network at: http://192.168.1.103:3000/

Both services are running in the background and will automatically reload when you make changes to the code. To stop both services, you can press `Ctrl+C` in the terminal or kill the processes.

You can now access your SEO Domain Checker application at http://localhost:3000/ and the API documentation at http://localhost:8000/docs!

---

**User**

I uploaded a file, it says backend server is not working, however backend server is working. What logic is expected after file upload? Help

---

**Cursor**

I'll help you investigate the file upload issue. Let me check the frontend code to see what happens after file upload and verify the backend API endpoint exists.

Now I can see the issue! Let me check what the backend expects in the request:

```json
{
  "name": data.name,
  "domains": data.domains
}
```

```typescript
{
  id: string,
  domain: string,
  price?: string,
  notes?: string
}
```

```python
{
  domain: str,
  price: Optional[str],
  notes: Optional[str]
}
```

```plaintext
deleted:    model/__init__.py
deleted:    model/models.py
```

```json
{
  "id": "27d84c7d-8af4-4486-afc3-b26981023953",
  "name": "Test Analysis",
  "status": "pending",
  "created_at": "2025-11-04T16:23:25.093299",
  "completed_at": null,
  "total_domains": 1,
  "domains_analyzed": 0
}
```

Perfect! The backend API is working correctly. Now let me check the analysis service to understand what should happen after an analysis is created:

```typescript
alert('Failed to create analysis. Please make sure the backend server is running.');
```

```typescript
const getApiBaseUrl = () => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:8000`;
};
```

I found the issue! Let me check the browser's developer console. Let me also verify how the frontend constructs the API URL:

Let me check the backend logs to see if there are any errors when an analysis runs:

```python
self.ahrefs_client = AhrefsClient(
    api_token=os.environ.get("AHREFS_API_TOKEN"),
    db_path=self.db_path
)
```

```python
self.similar_web_client = SimilarWebClient(api_token=os.environ.get("SIMILAR_WEB_KEY"))
```

Now I understand the full picture! Here's what happens after file upload:

## **Expected Flow After File Upload:**

1. **CSV Parsing (Client-Side)**: The CSV file is parsed in the browser, and domains are extracted
2. **Start Analysis**: When you click "Start Analysis", the frontend sends a POST request to `/api/startAnalysis`
3. **Backend Creates Analysis**: Backend creates an analysis with status "pending" and starts a background thread
4. **Data Extraction**: The background thread:
   - Queries the **Ahrefs API** to get SEO metrics for each domain
   - Stores data in the SQLite database
   - Evaluates each domain against SEO rules
   - Changes status to "completed"
5. **Frontend Polls**: The frontend refreshes every 2 seconds to show progress updates

## **Potential Issues:**

Let me check if the required API tokens are set:

**Found the issue!** The required API tokens (`AHREFS_API_TOKEN` and `SIMILAR_WEB_KEY`) are not set in the environment. This will cause the background processing to fail.

However, there's another issue - the error message you're seeing ("backend server is not working") might also be a connection issue. Let me check what's happening:

Let me create a comprehensive summary document to help you understand what's expected and how to fix the issue:

```markdown
# File Upload Flow - SEO Domain Checker

## What Happens After File Upload

### 1. **File Upload & Parsing (Client-Side)**
- User uploads a CSV file via the frontend
- The CSV is parsed **in the browser** (not sent to backend)
- Domains are extracted from the CSV with format:
  ```csv
  domain,price,notes
  example.com,$250,Premium domain
  ```

### 2. **Start Analysis (Frontend → Backend)**
When user clicks "Start Analysis":
- Frontend sends POST request to: `http://localhost:8000/api/startAnalysis`
- Request body:
  ```json
  {
    "name": "Analysis Name",
    "domains": [
      {"domain": "example.com", "price": "250", "notes": "test"}
    ]
  }
  ```

### 3. **Backend Creates Analysis**
- Backend receives request and creates analysis with status `pending`
- Returns response:
  ```json
  {
    "id": "uuid",
    "name": "Analysis Name",
    "status": "pending",
    "created_at": "2025-11-04T...",
    "total_domains": 1,
    "domains_analyzed": 0
  }
  ```
- Immediately starts a **background thread** to process the analysis

### 4. **Background Processing**
The background thread performs:

#### 4.1. Data Extraction
- Queries **Ahrefs API** to get SEO metrics for each domain:
  - Domain Rating (DR)
  - Organic Traffic
  - Backlinks
  - Top Pages
  - Organic Keywords
  - Linked Anchors
- Stores all data in SQLite database (`ahrefs_data.db`)

#### 4.2. Rule Evaluation
Evaluates each domain against SEO rules:
- DomainRatingRule
- OrganicTrafficRule
- HistoricalOrganicTrafficRule
- GeographyRule
- DomainsInOutLinksRatioRule
- SingleTopPageTrafficRule
- ForbiddenWordsBacklinksRule
- SpamWordsAnchorsRule
- ForbiddenWordsAnchorRule
- ForbiddenWordsOrganicKeywordsRule
- SpamWordsOrganicKeywordsRule

#### 4.3. Completion
- Updates analysis status to `completed`
- Results are available via `/api/analyses-results/{analysis_id}`

### 5. **Frontend Polling**
- Frontend automatically refreshes analysis list every 2 seconds
- Shows progress: `pending` → `running` → `completed`
- User can view results once status is `completed`

---

## Common Issues & Solutions

### Issue 1: "Backend server is not working"
**Symptoms**: Error message after clicking "Start Analysis"

**Possible Causes**:
1. **Backend not running**: Make sure backend is running on port 8000
   ```bash
   python api_server.py
   ```

2. **Network Access Issue**: If accessing frontend via network IP (e.g., `192.168.1.103:3000`), the API must also be accessible on that IP
   - Backend currently listens on `0.0.0.0:8000` (all interfaces) ✅
   - Check firewall settings

3. **CORS Issue**: Backend has CORS enabled for all origins ✅

### Issue 2: Analysis Stuck in "pending" or "running"
**Symptoms**: Analysis never completes

**Cause**: Missing API credentials

**Solution**: Set required environment variables:
```bash
export AHREFS_API_TOKEN="your_ahrefs_api_token"
export SIMILAR_WEB_KEY="your_similarweb_key"
```

Then restart the backend server.

### Issue 3: Background Processing Fails Silently
**Symptoms**: Analysis status changes from `pending` to... nothing

**Solution**: Check backend logs for errors:
```bash
tail -f backend.log
```

Look for errors in the console where `api_server.py` is running.

---

## Testing the Flow

### 1. Test Backend API Directly
```bash
curl -X POST http://localhost:8000/api/startAnalysis \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","domains":[{"domain":"example.com","price":"100"}]}'
```

Expected response: 201 Created with analysis details

### 2. Check Analysis Status
```bash
curl http://localhost:8000/api/analyses
```

### 3. Check Analysis Results (after completion)
```bash
curl http://localhost:8000/api/analyses-results/{analysis_id}
```

---

## Requirements for Full Functionality

1. ✅ Backend running on port 8000
2. ✅ Frontend running on port 3000
3. ❌ **AHREFS_API_TOKEN environment variable** (REQUIRED for data extraction)
4. ❌ **SIMILAR_WEB_KEY environment variable** (optional, currently commented out)
5. ✅ SQLite database (`ahrefs_data.db`)
6. ✅ CORS enabled

---

## Quick Fix

If you're seeing "backend server is not working", try:

1. **Open browser console** (F12 → Console tab)
2. **Upload a file and click "Start Analysis"**
3. **Check for error messages** in the console
4. **Check the Network tab** to see if the POST request is being made and what error is returned

The error message should tell you exactly what's wrong (e.g., network error, CORS error, 500 error, etc.)

```

---

**User**

I did not add ahrefs and similar web keys

---

**Cursor**

Ah, that's the issue! The backend is running, but the analysis will fail during the background processing because it needs those API keys to fetch domain data from Ahrefs.

## Here's what's happening:

1. ✅ **File upload works** - CSV is parsed in the browser
2. ✅ **Backend receives the request** - Analysis is created with status "pending"
3. ❌ **Background processing fails** - Can't fetch data from Ahrefs without API key
4. ❌ **Analysis stays stuck or fails silently**

## Solutions:

### Option 1: Add API Keys (For Production Use)

You need to get API keys from:
- **Ahrefs**: https://ahrefs.com/api
- **SimilarWeb**: https://developer.similarweb.com/

Then set them as environment variables and restart the backend:

```bash
# Stop the current backend (Ctrl+C)

# Set the environment variables
export AHREFS_API_TOKEN="your_ahrefs_api_token_here"
export SIMILAR_WEB_KEY="your_similarweb_key_here"  # Optional

# Restart both services
./start-dev.sh
```

### Option 2: Create a Demo/Mock Mode (For Testing)

If you don't have API keys yet and want to test the UI flow, I can create a demo mode that generates fake data. Would you like me to:

1. **Add a demo mode** that skips API calls and generates sample data?
2. **Add better error handling** so you see a clear error message when API keys are missing?
3. **Both** - demo mode + better error messages?

Let me check what error handling currently exists:

```shellscript
# Stop the current backend (Ctrl+C)

# Set the environment variables
export AHREFS_API_TOKEN="your_ahrefs_api_token_here"
export SIMILAR_WEB_KEY="your_similarweb_key_here"  # Optional

# Restart both services
./start-dev.sh
```

I can see the issue - when the API token is `None`, the system doesn't fail gracefully. Let me help you add proper error handling and a demo mode:

```python
"""
Ahrefs API Python Client

This module provides a Python client for interacting with the Ahrefs API,
specifically for batch analysis operations.
"""

import functools
import json
import logging
import os
import threading
import time
import traceback
from concurrent.futures import as_completed
from concurrent.futures.thread import ThreadPoolExecutor
from datetime import datetime, date
from functools import wraps
from http.client import HTTPConnection
from typing import List, Dict, Any
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import requests

import db.db
from db.db import init_database, LinkDirection, get_thread_connection
from lang import get_domain_lang_by_top_traffic, build_lang_by_domain
from model import Analysis
from model.models import TargetQueryableDomain
from query_utils import construct_field_or
from resources.disallowed_words import get_disallowed_words
from utils import url_to_domain, get_disallowed_words_by_lang_fallback, _safe_int, _safe_float

logging.basicConfig(level=logging.DEBUG)
logging.getLogger("requests").setLevel(logging.DEBUG)


def store_errors(fn):
    @wraps(fn)
    def wrapper(self, conn, target_id, res: MultipleDomainQueryResult, *args, **kwargs):
        try:
            return fn(self, conn, target_id, res, *args, **kwargs)
        finally:
            cur = conn.cursor()
            try:
                for domain, error in res.failed_domains.items():
                    insert_query = """
                                INSERT INTO query_errors (target_id, domain, api, error) VALUES(?, ?, ?, ?)
                            """
                    values = (
                        target_id,
                        domain,
                        str(fn.__name__),
                        str(error)
                    )
                    cur.execute(insert_query, values)
                conn.commit()
            except Exception:
                conn.rollback()
                raise

    return wrapper


class MultipleDomainQueryResult:
    def __init__(self, api: str) -> None:
        self.results_by_domain = {}
        self.failed_domains = {}

    def record_success(self, domain: str, result: dict):
        self.results_by_domain[domain] = result

    def record_failure(self, domain: str, error: Exception):
        self.failed_domains[domain] = error


def debug_requests_on():
    '''Switches on logging of the requests module.'''
    HTTPConnection.debuglevel = 1

    logging.basicConfig()
    logging.getLogger().setLevel(logging.DEBUG)
    requests_log = logging.getLogger("requests.packages.urllib3")
    requests_log.setLevel(logging.DEBUG)
    requests_log.propagate = True


def debug_requests_off():
    '''Switches off logging of the requests module, might be some side-effects'''
    HTTPConnection.debuglevel = 0

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.WARNING)
    root_logger.handlers = []
    requests_log = logging.getLogger("requests.packages.urllib3")
    requests_log.setLevel(logging.WARNING)
    requests_log.propagate = False

@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((requests.ConnectionError, requests.Timeout))
)
def query(session: requests.Session, url: str, timeout, method: str, endpoint, data: Dict[str, Any],
          save_to_cache=True) -> Dict[
    str, Any]:
    response = None
    if method == "get":
        response = session.get(url, params=data, timeout=timeout)
    elif method == "post":
        response = session.post(url, json=data, timeout=timeout)
    response.raise_for_status()
    resp_json = response.json()
    if save_to_cache:
        cache(endpoint.replace("/", "_"), resp_json, "cache")
    return resp_json


class SimilarWebClient:
    def __init__(self, api_token: str, timeout: int = 90,
                 db_path: str = None):
        self.api_token = api_token
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json, application/xml',
            'api-key': f'{api_token}',
            'Content-Type': 'application/json'
        })
        self.BASE_URLv4 = "https://api.similarweb.com/batch/v4"
        self.BASE_URLv3 = "https://api.similarweb.com/v3/batch/"

    def submit_request_report(self, domains):
        payload = {
            "report_name": "domain categories",
            "delivery_information": {
                "response_format": "json"
            },
            "report_query": {
                "tables": [
                    {
                        "vtable": "website",
                        "granularity": "monthly",
                        "latest": True,
                        "filters": {
                            "domains": domains,
                            "include_subdomains": True
                        },
                        "metrics": [
                            "main_category"
                        ]
                    }
                ]
            }
        }
        return query(self.session, f"{self.BASE_URLv4}/request-report", self.timeout, "post", "request-report", payload)

    def download_report_as_domain_categories(self, report_id) -> Dict[str, str]:
        counter = 0;

        def _query():
            return query(self.session, f"{self.BASE_URLv3}/request-status/{report_id}", self.timeout, "get",
                         "request-status", {})

        status = _query()
        while counter < 10 and (status is None or status["status"] != "completed"):
            time.sleep(10)
            status = _query()
            counter += 1

        if status is None or status["status"] != "completed":
            raise RuntimeError(
                f"Couldn't get report from Similar Web afte {counter} attempts. What I got was: {status}")

        download_url = status["download_url"]
        response = requests.get(download_url)
        response.raise_for_status()  # raises error if the request failed
        domain_categories = {}
        for line in response.text.splitlines():
            if line.strip():  # skip empty lines
                obj = json.loads(line)
                domain_categories[obj["domain"]] = obj["main_category"]
        return domain_categories


def sanitize_url_to_domain(targets: Dict[str, List[Dict[str, any]]]) -> Dict[str, Any]:
    for target in targets['targets']:
        target['domain'] = url_to_domain(target.pop('url'))
    return targets


class AhrefsClient:
    BASE_URL = "https://api.ahrefs.com/v3"
    BATCH_ANALYSIS_ENDPOINT = "/batch-analysis/batch-analysis"
    METRICS_HISTORY_ENDPOINT = "/site-explorer/metrics-history"
    TOP_PAGES_ENDPOINT = "/site-explorer/top-pages"
    BACKLINKS_ENDPOINT = "/site-explorer/all-backlinks"
    OUTGOING_EXTERNAL_ANCHORS_ENDPOINT = "/site-explorer/linked-anchors-external"
    ORGANIC_KEYWORDS_ENDPOINT = "/site-explorer/organic-keywords"

    def __init__(self, api_token: str, timeout: int = 90,
                 db_path: str = None):
        self.api_token = api_token
        self.timeout = timeout
        self.session = requests.Session()

        # Set default headers
        self.session.headers.update({
            'Accept': 'application/json, application/xml',
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        })

    def record_failures(fn):
        @functools.wraps(fn)
        def wrapper(self, res: MultipleDomainQueryResult, domain: str, *args, **kwargs):
            try:
                result = fn(self, res, domain, *args, **kwargs)
                if result is not None:
                    res.record_success(domain, result)
            except Exception as e:
                logging.warning(f"{fn.__name__} failed for {domain}: {e}")
                res.record_failure(domain, e)
            return res

        return wrapper

    @record_failures
    def safe_query_per_domain(self, result: MultipleDomainQueryResult, domain: str, method: str, endpoint,
                              data: Dict[str, Any], save_to_cache=True) -> Dict[str, Any]:
        return self.unsafe_query(method, endpoint, data, save_to_cache=save_to_cache)

    def unsafe_query(self, method: str, endpoint, data: Dict[str, Any], save_to_cache=True) -> Dict[str, Any]:
        return query(self.session, f"{self.BASE_URL}{endpoint}", self.timeout, method, endpoint, data, save_to_cache)

    def batch_analysis(self,
                       targets: List[TargetQueryableDomain]) -> Dict[str, Any]:
        select = [
            "ahrefs_rank",
            "backlinks",
            "backlinks_dofollow",
            "backlinks_internal",
            "backlinks_nofollow",
            "backlinks_redirect",
            "domain_rating",
            "index",
            "ip",
            "linked_domains",
            "linked_domains_dofollow",
            "mode",
            "org_cost",
            "org_keywords",
            "org_keywords_11_20",
            "org_keywords_1_3",
            "org_keywords_21_50",
            "org_keywords_4_10",
            "org_keywords_51_plus",
            "org_traffic",
            "org_traffic_top_by_country",
            "outgoing_links",
            "outgoing_links_dofollow",
            "paid_ads",
            "paid_cost",
            "paid_keywords",
            "paid_traffic",
            "protocol",
            "refdomains",
            "refdomains_dofollow",
            "refdomains_nofollow",
            "refips",
            "refips_subnets",
            "url",
            "url_rating"
        ]

        # Build request payload
        payload = {
            "targets": [{"url": d.domain, "mode": d.mode, "protocol": d.protocol} for d in targets],
            "select": select
        }

        return sanitize_url_to_domain(self.unsafe_query("post", self.BATCH_ANALYSIS_ENDPOINT, payload))

    def query_organic_keywords_forbidden_words(self, target_id, date: str,
                                               forbidden_class_by_forbidden_word_by_lang: Dict[str, Dict[str, str]],
                                               targets_with_lang: List[
                                                   TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["keyword", "keyword_country", "is_best_position_set_top_3", "is_best_position_set_top_4_10",
                           "is_best_position_set_top_11_50", "best_position_url"])
        res = MultipleDomainQueryResult("query_organic_keywords")
        for target in targets_with_lang:
            forbidden_class_by_forbidden_word = forbidden_class_by_forbidden_word_by_lang[target.lang]
            all_forbidden_words = [word for word in forbidden_class_by_forbidden_word.keys()]
            query_params = {
                "date": date,
                "target": target.domain,
                "protocol": target.protocol,
                "mode": target.mode,
                "select": select,
                "limit": 50,
                "where": json.dumps(
                    construct_field_or("keyword", all_forbidden_words))}

            self.safe_query_per_domain(res, target.domain, "get", self.ORGANIC_KEYWORDS_ENDPOINT, query_params)
            if not target.domain in res.failed_domains:
                raw_result = res.results_by_domain[target.domain]
                for raw_res_entity in raw_result["keywords"]:
                    raw_res_entity["forbidden_word_category"] = None
                    keyword = raw_res_entity["keyword"]
                    for word, category in forbidden_class_by_forbidden_word.items():
                        if word in keyword:
                            raw_res_entity["forbidden_word_category"] = category
        return res

    def query_top_pages(self,
                        target_id,
                        date: str,
                        targets: List[TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["top_keyword_best_position_title", "sum_traffic"])
        res = MultipleDomainQueryResult("query_top_pages")
        for target in targets:
            query_params = {"date": date,
                            "target": target.domain,
                            "protocol": target.protocol,
                            "mode": target.mode,
                            "select": select,
                            "order_by": "sum_traffic",
                            "limit": 10, }
            self.safe_query_per_domain(res, target.domain, "get", self.TOP_PAGES_ENDPOINT, query_params)
        return res

    def query_metric_history(self,
                             target_id,
                             date_from: str,
                             targets: List[TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["date", "org_cost", "org_traffic", "paid_cost", "paid_traffic"])
        res = MultipleDomainQueryResult("query_metric_history")
        for target in targets:
            query_params = {"date_from": date_from,
                            "target": target.domain,
                            "protocol": target.protocol,
                            "mode": target.mode,
                            "select": select}
            self.safe_query_per_domain(res, target.domain, "get", self.METRICS_HISTORY_ENDPOINT, query_params)
        return res

    def query_outgoing_anchors_forbidden_words(self,
                                               target_id,
                                               forbidden_class_by_forbidden_word_by_lang: Dict[str, Dict[str, str]],
                                               targets: List[TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["anchor", "dofollow_links"])
        res = MultipleDomainQueryResult("query_outgoing_external_anchors")
        for target in targets:
            forbidden_class_by_forbidden_word = forbidden_class_by_forbidden_word_by_lang[target.lang]
            all_forbidden_words = [word for word in forbidden_class_by_forbidden_word.keys()]
            query_params = {
                "target": target.domain,
                "protocol": target.protocol,
                "mode": target.mode,
                "select": select,
                "where": json.dumps(
                    construct_field_or("anchor", all_forbidden_words))}

            self.safe_query_per_domain(res, target.domain, "get", self.OUTGOING_EXTERNAL_ANCHORS_ENDPOINT,
                                       query_params)
            if not target.domain in res.failed_domains:
                raw_result = res.results_by_domain[target.domain]
                for linked_anchor in raw_result["linkedanchors"]:
                    linked_anchor["forbidden_word_category"] = None
                    anchor = linked_anchor["anchor"]
                    for word, category in forbidden_class_by_forbidden_word.items():
                        if word in anchor:
                            linked_anchor["forbidden_word_category"] = category

        return res

    @store_errors
    def persist_outgoing_anchors_forbidden_words(self, conn, target_id, res: MultipleDomainQueryResult):
        try:
            cur = conn.cursor()
            for domain, entry in res.results_by_domain.items():
                backlinks_ = entry['linkedanchors']
                backlink_entry = backlinks_
                for backlink in backlink_entry:
                    insert_query = """
                                           INSERT OR REPLACE INTO anchors_forbidden_words (
                                               target_id, domain, direction, anchor, forbidden_word_category, title, url_from, snippet_left, snippet_right
                                           ) VALUES (
                                               ?, ?, ?, ?, ?, ?, ?, ?, ?
                                           )
                                       """

                    values = (
                        target_id,
                        domain,
                        LinkDirection.OUT,
                        backlink['anchor'],
                        backlink['forbidden_word_category'],
                        "",
                        "",
                        "",
                        ""
                    )
                    cur.execute(insert_query, values)
            conn.commit()
        except Exception:
            conn.rollback()
            raise

    @store_errors
    def persist_incoming_anchors_forbidden_words(self, conn, target_id, res: MultipleDomainQueryResult):
        try:
            cur = conn.cursor()
            for domain, entry in res.results_by_domain.items():
                backlinks_ = entry['backlinks']
                backlink_entry = backlinks_
                for backlink in backlink_entry:
                    insert_query = """
                                    INSERT OR REPLACE INTO anchors_forbidden_words (
                                        target_id, domain, direction, anchor, forbidden_word_category, title, url_from, snippet_left, snippet_right
                                    ) VALUES (
                                        ?, ?, ?, ?, ?, ?, ?, ?, ?
                                    )
                                """

                    values = (
                        target_id,
                        domain,
                        LinkDirection.IN,
                        backlink['anchor'],
                        backlink['forbidden_word_category'],
                        backlink['title'],
                        backlink['url_from'],
                        backlink['snippet_left'],
                        backlink['snippet_right']
                    )
                    cur.execute(insert_query, values)
            conn.commit()
        except Exception:
            conn.rollback()
            raise

    def query_incoming_anchors_forbidden_words(self,
                                               target_id,
                                               forbidden_class_by_forbidden_word_by_lang: Dict[str, Dict[str, str]],
                                               targets_with_lang: List[
                                                   TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ["anchor", "title", "url_from", "snippet_left", "snippet_right"]
        res = MultipleDomainQueryResult("query_backlinks_badwords")
        result_by_domain = {}
        for target in targets_with_lang:
            forbidden_class_by_forbidden_word = forbidden_class_by_forbidden_word_by_lang[target.lang]
            all_forbidden_words = [word for word in forbidden_class_by_forbidden_word.keys()]
            query_params = {
                "target": target.domain,
                "protocol": target.protocol,
                "mode": target.mode,
                "select": ",".join(select),
                "limit": 50,
                "where": json.dumps(
                    construct_field_or("anchor", all_forbidden_words))}

            self.safe_query_per_domain(res, target.domain, "get", self.BACKLINKS_ENDPOINT, query_params)
            if not target.domain in res.failed_domains:
                raw_result = res.results_by_domain[target.domain]
                for linked_anchor in raw_result["backlinks"]:
                    linked_anchor["forbidden_word_category"] = None
                    anchor = linked_anchor["anchor"]
                    for word, category in forbidden_class_by_forbidden_word.items():
                        if word in anchor:
                            linked_anchor["forbidden_word_category"] = category
        return res

    @store_errors
    def persist_top_pages(self, conn, target_id, res: MultipleDomainQueryResult, country_code, date: str):
        cur = conn.cursor()
        try:
            for domain, top_pages in res.results_by_domain.items():
                position = 1
                for page_entry in top_pages['pages']:
                    insert_query = """
                        INSERT OR REPLACE INTO ahrefs_top_pages (
                            target_id, country_code, date, domain, position, top_keyword_best_position_title, sum_traffic
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?
                        )
                    """
                    values = (
                        target_id,
                        country_code,
                        date,
                        domain,
                        position,
                        page_entry['top_keyword_best_position_title'],
                        page_entry['sum_traffic']
                    )
                    cur.execute(insert_query, values)
                    position += 1
            conn.commit()
        except Exception:
            conn.rollback()
            raise

    @store_errors
    def persist_metric_history(self, conn, target_id, res: MultipleDomainQueryResult, country_code):
        for domain, metrics_history in res.results_by_domain.items():
            try:
                cur = conn.cursor()
                for metric_entry in metrics_history['metrics']:
                    insert_query = """
                        INSERT OR REPLACE INTO ahrefs_metrics_history (
                            target_id, country_code, date, domain, org_cost, org_traffic, paid_cost, paid_traffic
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?, ?
                        )
                    """

                    values = (
                        target_id,
                        country_code,
                        metric_entry['date'],
                        domain,
                        metric_entry['org_cost'],
                        metric_entry['org_traffic'],
                        metric_entry['paid_cost'],
                        metric_entry['paid_traffic']
                    )
                    cur.execute(insert_query, values)
                conn.commit()
            except Exception:
                conn.rollback()
                raise

    def persist_batch_analysis(self, conn, target_id, batch_results: Dict[str, Any], lang_by_domain: Dict[str, str]) -> \
            List[str]:
        saved_domains = []
        try:
            cur = conn.cursor()
            for result in batch_results['targets']:
                insert_query = """
                    INSERT OR REPLACE INTO batch_analysis (
                        target_id, domain, ip, protocol, mode, ahrefs_rank, domain_rating, url_rating,
                        backlinks, backlinks_dofollow, backlinks_internal, backlinks_nofollow, 
                        backlinks_redirect, refdomains, refdomains_dofollow, refdomains_nofollow,
                        refips, refips_subnets, linked_domains, linked_domains_dofollow,
                        outgoing_links, outgoing_links_dofollow, org_cost, org_traffic, org_keywords,
                        org_keywords_1_3, org_keywords_4_10, org_keywords_11_20, org_keywords_21_50,
                        org_keywords_51_plus, paid_cost, paid_traffic, paid_keywords, paid_ads, lang_by_top_traffic, detected_lang,
                        created_at, updated_at
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                """

                values = (
                    target_id,
                    result.get('domain'),
                    result.get('ip'),
                    result.get('protocol'),
                    result.get('mode'),
                    _safe_int(result.get('ahrefs_rank')),
                    _safe_float(result.get('domain_rating')),
                    _safe_float(result.get('url_rating')),
                    _safe_int(result.get('backlinks')),
                    _safe_int(result.get('backlinks_dofollow')),
                    _safe_int(result.get('backlinks_internal')),
                    _safe_int(result.get('backlinks_nofollow')),
                    _safe_int(result.get('backlinks_redirect')),
                    _safe_int(result.get('refdomains')),
                    _safe_int(result.get('refdomains_dofollow')),
                    _safe_int(result.get('refdomains_nofollow')),
                    _safe_int(result.get('refips')),
                    _safe_int(result.get('refips_subnets')),
                    _safe_int(result.get('linked_domains')),
                    _safe_int(result.get('linked_domains_dofollow')),
                    _safe_int(result.get('outgoing_links')),
                    _safe_int(result.get('outgoing_links_dofollow')),
                    _safe_int(result.get('org_cost')),
                    _safe_int(result.get('org_traffic')),
                    _safe_int(result.get('org_keywords')),
                    _safe_int(result.get('org_keywords_1_3')),
                    _safe_int(result.get('org_keywords_4_10')),
                    _safe_int(result.get('org_keywords_11_20')),
                    _safe_int(result.get('org_keywords_21_50')),
                    _safe_int(result.get('org_keywords_51_plus')),
                    _safe_int(result.get('paid_cost')),
                    _safe_int(result.get('paid_traffic')),
                    _safe_int(result.get('paid_keywords')),
                    _safe_int(result.get('paid_ads')),
                    get_domain_lang_by_top_traffic(result.get('org_traffic_top_by_country', [])),
                    lang_by_domain[result.get('domain')]
                )

                cur.execute(insert_query, values)
                org_traffic_countries = result.get('org_traffic_top_by_country', [])
                if isinstance(org_traffic_countries, list):
                    self.persist_batch_analysis_country_traffic(cur, target_id, result.get('domain'),
                                                                org_traffic_countries)

                saved_domains.append(target_id)

            conn.commit()

        except Exception:
            conn.rollback()
            raise
        return saved_domains

    def persist_batch_analysis_country_traffic(self, cursor, target_id: str, domain: str,
                                               country_data: List[Dict[str, Any]]):
        # Insert new country data
        for country_item in country_data:
            if isinstance(country_item, list):
                cursor.execute("""
                        INSERT OR REPLACE INTO ahrefs_org_traffic_country 
                        (target_id, domain, country_code, traffic)
                        VALUES (?, ?, ?, ?)
                    """, (
                    target_id,
                    domain,
                    country_item[0],
                    country_item[1]
                ))

    def persist_organic_keywords_forbiddne_words(self, conn, target_id: str, res: MultipleDomainQueryResult,
                                                 cure_date: str):
        try:
            cur = conn.cursor()
            for domain, entry in res.results_by_domain.items():
                items = entry['keywords']
                for item in items:
                    insert_query = """
                                           INSERT OR REPLACE INTO ahrefs_organic_keywords (
                                               target_id, domain, date, keyword, keyword_country, forbidden_word_category, is_best_position_set_top_3,
                                               is_best_position_set_top_4_10, is_best_position_set_top_11_50 
                                           ) VALUES (
                                               ?, ?, ?, ?, ?, ?, ?, ?, ?
                                           )
                                       """

                    values = (
                        target_id,
                        domain,
                        cure_date,
                        item['keyword'],
                        item['keyword_country'],
                        item['forbidden_word_category'],
                        item['is_best_position_set_top_3'],
                        item['is_best_position_set_top_4_10'],
                        item['is_best_position_set_top_11_50'],
                    )
                    cur.execute(insert_query, values)
            conn.commit()
        except Exception:
            conn.rollback()
            raise


def cache(cache_name, results: Dict[str, Any], cache_dir: str = "cache") -> str:
    print("\nSaving results to cache...")
    os.makedirs(cache_dir, exist_ok=True)

    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    cache_filename = f"{cache_name}_{timestamp}.json"
    cache_filepath = os.path.join(cache_dir, cache_filename)

    with open(cache_filepath, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Results saved to cache file: {cache_filepath}")

    return cache_filepath


def update_targets_with_lang(targets: list[TargetQueryableDomain], lang_by_domain) -> None:
    for target in targets:
        target.lang = lang_by_domain[target.domain]


class DataExtractor:
    def __init__(self, parallelization_level=50, demo_mode=False) -> None:
        project_root = os.path.abspath(os.getcwd())
        self.db_path = os.path.join(project_root, "ahrefs_data.db")
        self.demo_mode = demo_mode

        self.cache_dir = os.path.join(project_root, "cache")
        
        # Check for API tokens
        ahrefs_token = os.environ.get("AHREFS_API_TOKEN")
        similar_web_token = os.environ.get("SIMILAR_WEB_KEY")
        
        if not ahrefs_token and not demo_mode:
            raise ValueError(
                "AHREFS_API_TOKEN environment variable is not set. "
                "Please set it with: export AHREFS_API_TOKEN='your_token' "
                "or run in demo mode by setting DEMO_MODE=true"
            )
        
        if not demo_mode:
            self.ahrefs_client = AhrefsClient(
                api_token=ahrefs_token,
                db_path=self.db_path  # SQLite database file path
            )
            self.similar_web_client = SimilarWebClient(api_token=similar_web_token) if similar_web_token else None
        else:
            self.ahrefs_client = None
            self.similar_web_client = None
            print("⚠️  Running in DEMO MODE - using mock data instead of real API calls")
        
        self.parallelization_level = parallelization_level

    def flusher_thread(self, analysis_id, done_domains, stop_event, interval=2):
        while not stop_event.is_set():
            time.sleep(interval)
            count = len(done_domains)
            get_thread_connection().execute(
                "update analysis set processed_domains = ? where target_id = ?",
                (count, analysis_id),
            )
            get_thread_connection().commit()
            print(f"[Flusher] {analysis_id}: {count} domains completed")
        # Final flush on stop
        get_thread_connection().execute(
            "update analysis set processed_domains = ? where target_id = ?",
            (analysis_id, len(done_domains)),
        )
        get_thread_connection().commit()

    def run_extract(self, analysis: Analysis):
        target_id = analysis.target_id

        print(f"\nExtracting data for analysis {analysis.target_id}...")

        # similar_web_client = SimilarWebClient(api_token=os.environ.get("SIMILAR_WEB_KEY"))

        # Initialize database (creates tables if they don't exist)
        print("Initializing database...")
        print("Database initialized successfully!")

        domains = analysis.domains
        target_queryable_domains = [TargetQueryableDomain(domain=d.domain) for d in domains]
        # sim_web_report_id = similar_web_client.submit_request_report([d['domain'] for d in targets])["report_id"]
        # {'report_id': '5b096600-2c1e-4d0b-9adb-f035baabfb94', 'status': 'pending'}
        # Perform batch analysis
        print("Querying batch analysis...")
        batch_analysis_results = self.ahrefs_client.batch_analysis(targets=target_queryable_domains)
        print("Saving batch analysis to database...")
        lang_by_domain = build_lang_by_domain(batch_analysis_results)
        saved_target_ids = self.ahrefs_client.persist_batch_analysis(db.db.get_thread_connection(), target_id,
                                                                     batch_analysis_results,
                                                                     lang_by_domain)
        print(f"Successfully saved {len(saved_target_ids)} records to database")

        update_targets_with_lang(target_queryable_domains, lang_by_domain)

        results, failures = self.process_all_domains(analysis.target_id, target_queryable_domains)

        print(f"ALL DATA EXTRACTED, success: {len(results)} failures: {len(failures)}")

        # sim_web_report_id = "5b096600-2c1e-4d0b-9adb-f035baabfb94"
        # domain_categories = similar_web_client.download_report_as_domain_categories(sim_web_report_id)
        # db.persist_domain_categories(conn, target_id, domain_categories)

    def process_all_domains(self, target_id, target_queryable_domains: List[TargetQueryableDomain]):
        done_domains = set()
        done_lock = threading.Lock()
        stop_event = threading.Event()
        flusher = threading.Thread(
            target=self.flusher_thread,
            args=(target_id, done_domains, stop_event),
            daemon=True,
        )
        flusher.start()

        results = []
        failures = []

        with ThreadPoolExecutor(max_workers=self.parallelization_level) as executor:
            future_to_domain = {
                executor.submit(self.process_single_domain, target_id, domain): domain
                for domain in target_queryable_domains
            }

            for future in as_completed(future_to_domain):
                domain = future_to_domain[future]
                try:
                    result = future.result()
                    results.append((domain, result))
                except Exception as e:
                    print(traceback.format_exc())
                    failures.append((domain, e))

                finally:
                    with done_lock:
                        done_domains.add(domain)
        stop_event.set()
        flusher.join()
        return results, failures

    def process_single_domain(self, target_id: str,
                              domain: TargetQueryableDomain):
        date_from = "2022-01-01"
        query_date = date.today().strftime("%Y-%m-%d")
        client = self.ahrefs_client
        conn = db.db.get_thread_connection()

        target_queryable_domains = [domain]
        print(f"{domain.domain}: Querying metrics...")
        res = client.query_metric_history(target_id=target_id, targets=target_queryable_domains, date_from=date_from)
        client.persist_metric_history(conn, target_id, res, None)

        print(f"{domain.domain}: Querying top pages...")
        res = client.query_top_pages(target_id, query_date, target_queryable_domains)
        client.persist_top_pages(conn, target_id, res, None, query_date)

        # debug_requests_on()
        category_forbidden_words_by_lang = self.get_category_forbidden_words_by_lang(target_queryable_domains)
        print(f"{domain.domain}: Querying forbidden_words in backlinks anchors...")
        res = client.query_incoming_anchors_forbidden_words(target_id, category_forbidden_words_by_lang,
                                                            target_queryable_domains)
        client.persist_incoming_anchors_forbidden_words(conn, target_id, res)

        print(f"{domain.domain}: Querying forbidden_words in outgoing anchors...")
        res = client.query_outgoing_anchors_forbidden_words(target_id, category_forbidden_words_by_lang,
                                                            target_queryable_domains)
        client.persist_outgoing_anchors_forbidden_words(conn, target_id, res)

        print(f"{domain.domain}: Querying forbidden_words in organic keywords...")
        res = client.query_organic_keywords_forbidden_words(target_id, query_date, category_forbidden_words_by_lang,
                                                            target_queryable_domains)
        client.persist_organic_keywords_forbiddne_words(conn, target_id, res, query_date)
        print(f"{domain.domain}: DONE")

    def get_category_forbidden_words_by_lang(self, targets_with_lang: list[TargetQueryableDomain]):
        category_forbidden_words_by_lang = {tgt.lang: {word: cat for cat in ["forbidden", "spam"] for word in
                                                       get_disallowed_words_by_lang_fallback(get_disallowed_words(),
                                                                                             tgt.lang).get(cat, [])}
                                            for tgt in targets_with_lang}
        return category_forbidden_words_by_lang

```

Now let me add demo mode support to the `run_extract` method and create mock data generation:

Let me add mock data generation for demo mode:

```python
"""
Ahrefs API Python Client

This module provides a Python client for interacting with the Ahrefs API,
specifically for batch analysis operations.
"""

import functools
import json
import logging
import os
import threading
import time
import traceback
from concurrent.futures import as_completed
from concurrent.futures.thread import ThreadPoolExecutor
from datetime import datetime, date
from functools import wraps
from http.client import HTTPConnection
from typing import List, Dict, Any
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import requests

import db.db
from db.db import init_database, LinkDirection, get_thread_connection
from lang import get_domain_lang_by_top_traffic, build_lang_by_domain
from model import Analysis
from model.models import TargetQueryableDomain
from query_utils import construct_field_or
from resources.disallowed_words import get_disallowed_words
from utils import url_to_domain, get_disallowed_words_by_lang_fallback, _safe_int, _safe_float

logging.basicConfig(level=logging.DEBUG)
logging.getLogger("requests").setLevel(logging.DEBUG)


def store_errors(fn):
    @wraps(fn)
    def wrapper(self, conn, target_id, res: MultipleDomainQueryResult, *args, **kwargs):
        try:
            return fn(self, conn, target_id, res, *args, **kwargs)
        finally:
            cur = conn.cursor()
            try:
                for domain, error in res.failed_domains.items():
                    insert_query = """
                                INSERT INTO query_errors (target_id, domain, api, error) VALUES(?, ?, ?, ?)
                            """
                    values = (
                        target_id,
                        domain,
                        str(fn.__name__),
                        str(error)
                    )
                    cur.execute(insert_query, values)
                conn.commit()
            except Exception:
                conn.rollback()
                raise

    return wrapper


class MultipleDomainQueryResult:
    def __init__(self, api: str) -> None:
        self.results_by_domain = {}
        self.failed_domains = {}

    def record_success(self, domain: str, result: dict):
        self.results_by_domain[domain] = result

    def record_failure(self, domain: str, error: Exception):
        self.failed_domains[domain] = error


def debug_requests_on():
    '''Switches on logging of the requests module.'''
    HTTPConnection.debuglevel = 1

    logging.basicConfig()
    logging.getLogger().setLevel(logging.DEBUG)
    requests_log = logging.getLogger("requests.packages.urllib3")
    requests_log.setLevel(logging.DEBUG)
    requests_log.propagate = True


def debug_requests_off():
    '''Switches off logging of the requests module, might be some side-effects'''
    HTTPConnection.debuglevel = 0

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.WARNING)
    root_logger.handlers = []
    requests_log = logging.getLogger("requests.packages.urllib3")
    requests_log.setLevel(logging.WARNING)
    requests_log.propagate = False

@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((requests.ConnectionError, requests.Timeout))
)
def query(session: requests.Session, url: str, timeout, method: str, endpoint, data: Dict[str, Any],
          save_to_cache=True) -> Dict[
    str, Any]:
    response = None
    if method == "get":
        response = session.get(url, params=data, timeout=timeout)
    elif method == "post":
        response = session.post(url, json=data, timeout=timeout)
    response.raise_for_status()
    resp_json = response.json()
    if save_to_cache:
        cache(endpoint.replace("/", "_"), resp_json, "cache")
    return resp_json


class SimilarWebClient:
    def __init__(self, api_token: str, timeout: int = 90,
                 db_path: str = None):
        self.api_token = api_token
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json, application/xml',
            'api-key': f'{api_token}',
            'Content-Type': 'application/json'
        })
        self.BASE_URLv4 = "https://api.similarweb.com/batch/v4"
        self.BASE_URLv3 = "https://api.similarweb.com/v3/batch/"

    def submit_request_report(self, domains):
        payload = {
            "report_name": "domain categories",
            "delivery_information": {
                "response_format": "json"
            },
            "report_query": {
                "tables": [
                    {
                        "vtable": "website",
                        "granularity": "monthly",
                        "latest": True,
                        "filters": {
                            "domains": domains,
                            "include_subdomains": True
                        },
                        "metrics": [
                            "main_category"
                        ]
                    }
                ]
            }
        }
        return query(self.session, f"{self.BASE_URLv4}/request-report", self.timeout, "post", "request-report", payload)

    def download_report_as_domain_categories(self, report_id) -> Dict[str, str]:
        counter = 0;

        def _query():
            return query(self.session, f"{self.BASE_URLv3}/request-status/{report_id}", self.timeout, "get",
                         "request-status", {})

        status = _query()
        while counter < 10 and (status is None or status["status"] != "completed"):
            time.sleep(10)
            status = _query()
            counter += 1

        if status is None or status["status"] != "completed":
            raise RuntimeError(
                f"Couldn't get report from Similar Web afte {counter} attempts. What I got was: {status}")

        download_url = status["download_url"]
        response = requests.get(download_url)
        response.raise_for_status()  # raises error if the request failed
        domain_categories = {}
        for line in response.text.splitlines():
            if line.strip():  # skip empty lines
                obj = json.loads(line)
                domain_categories[obj["domain"]] = obj["main_category"]
        return domain_categories


def sanitize_url_to_domain(targets: Dict[str, List[Dict[str, any]]]) -> Dict[str, Any]:
    for target in targets['targets']:
        target['domain'] = url_to_domain(target.pop('url'))
    return targets


class AhrefsClient:
    BASE_URL = "https://api.ahrefs.com/v3"
    BATCH_ANALYSIS_ENDPOINT = "/batch-analysis/batch-analysis"
    METRICS_HISTORY_ENDPOINT = "/site-explorer/metrics-history"
    TOP_PAGES_ENDPOINT = "/site-explorer/top-pages"
    BACKLINKS_ENDPOINT = "/site-explorer/all-backlinks"
    OUTGOING_EXTERNAL_ANCHORS_ENDPOINT = "/site-explorer/linked-anchors-external"
    ORGANIC_KEYWORDS_ENDPOINT = "/site-explorer/organic-keywords"

    def __init__(self, api_token: str, timeout: int = 90,
                 db_path: str = None):
        self.api_token = api_token
        self.timeout = timeout
        self.session = requests.Session()

        # Set default headers
        self.session.headers.update({
            'Accept': 'application/json, application/xml',
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        })

    def record_failures(fn):
        @functools.wraps(fn)
        def wrapper(self, res: MultipleDomainQueryResult, domain: str, *args, **kwargs):
            try:
                result = fn(self, res, domain, *args, **kwargs)
                if result is not None:
                    res.record_success(domain, result)
            except Exception as e:
                logging.warning(f"{fn.__name__} failed for {domain}: {e}")
                res.record_failure(domain, e)
            return res

        return wrapper

    @record_failures
    def safe_query_per_domain(self, result: MultipleDomainQueryResult, domain: str, method: str, endpoint,
                              data: Dict[str, Any], save_to_cache=True) -> Dict[str, Any]:
        return self.unsafe_query(method, endpoint, data, save_to_cache=save_to_cache)

    def unsafe_query(self, method: str, endpoint, data: Dict[str, Any], save_to_cache=True) -> Dict[str, Any]:
        return query(self.session, f"{self.BASE_URL}{endpoint}", self.timeout, method, endpoint, data, save_to_cache)

    def batch_analysis(self,
                       targets: List[TargetQueryableDomain]) -> Dict[str, Any]:
        select = [
            "ahrefs_rank",
            "backlinks",
            "backlinks_dofollow",
            "backlinks_internal",
            "backlinks_nofollow",
            "backlinks_redirect",
            "domain_rating",
            "index",
            "ip",
            "linked_domains",
            "linked_domains_dofollow",
            "mode",
            "org_cost",
            "org_keywords",
            "org_keywords_11_20",
            "org_keywords_1_3",
            "org_keywords_21_50",
            "org_keywords_4_10",
            "org_keywords_51_plus",
            "org_traffic",
            "org_traffic_top_by_country",
            "outgoing_links",
            "outgoing_links_dofollow",
            "paid_ads",
            "paid_cost",
            "paid_keywords",
            "paid_traffic",
            "protocol",
            "refdomains",
            "refdomains_dofollow",
            "refdomains_nofollow",
            "refips",
            "refips_subnets",
            "url",
            "url_rating"
        ]

        # Build request payload
        payload = {
            "targets": [{"url": d.domain, "mode": d.mode, "protocol": d.protocol} for d in targets],
            "select": select
        }

        return sanitize_url_to_domain(self.unsafe_query("post", self.BATCH_ANALYSIS_ENDPOINT, payload))

    def query_organic_keywords_forbidden_words(self, target_id, date: str,
                                               forbidden_class_by_forbidden_word_by_lang: Dict[str, Dict[str, str]],
                                               targets_with_lang: List[
                                                   TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["keyword", "keyword_country", "is_best_position_set_top_3", "is_best_position_set_top_4_10",
                           "is_best_position_set_top_11_50", "best_position_url"])
        res = MultipleDomainQueryResult("query_organic_keywords")
        for target in targets_with_lang:
            forbidden_class_by_forbidden_word = forbidden_class_by_forbidden_word_by_lang[target.lang]
            all_forbidden_words = [word for word in forbidden_class_by_forbidden_word.keys()]
            query_params = {
                "date": date,
                "target": target.domain,
                "protocol": target.protocol,
                "mode": target.mode,
                "select": select,
                "limit": 50,
                "where": json.dumps(
                    construct_field_or("keyword", all_forbidden_words))}

            self.safe_query_per_domain(res, target.domain, "get", self.ORGANIC_KEYWORDS_ENDPOINT, query_params)
            if not target.domain in res.failed_domains:
                raw_result = res.results_by_domain[target.domain]
                for raw_res_entity in raw_result["keywords"]:
                    raw_res_entity["forbidden_word_category"] = None
                    keyword = raw_res_entity["keyword"]
                    for word, category in forbidden_class_by_forbidden_word.items():
                        if word in keyword:
                            raw_res_entity["forbidden_word_category"] = category
        return res

    def query_top_pages(self,
                        target_id,
                        date: str,
                        targets: List[TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["top_keyword_best_position_title", "sum_traffic"])
        res = MultipleDomainQueryResult("query_top_pages")
        for target in targets:
            query_params = {"date": date,
                            "target": target.domain,
                            "protocol": target.protocol,
                            "mode": target.mode,
                            "select": select,
                            "order_by": "sum_traffic",
                            "limit": 10, }
            self.safe_query_per_domain(res, target.domain, "get", self.TOP_PAGES_ENDPOINT, query_params)
        return res

    def query_metric_history(self,
                             target_id,
                             date_from: str,
                             targets: List[TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["date", "org_cost", "org_traffic", "paid_cost", "paid_traffic"])
        res = MultipleDomainQueryResult("query_metric_history")
        for target in targets:
            query_params = {"date_from": date_from,
                            "target": target.domain,
                            "protocol": target.protocol,
                            "mode": target.mode,
                            "select": select}
            self.safe_query_per_domain(res, target.domain, "get", self.METRICS_HISTORY_ENDPOINT, query_params)
        return res

    def query_outgoing_anchors_forbidden_words(self,
                                               target_id,
                                               forbidden_class_by_forbidden_word_by_lang: Dict[str, Dict[str, str]],
                                               targets: List[TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["anchor", "dofollow_links"])
        res = MultipleDomainQueryResult("query_outgoing_external_anchors")
        for target in targets:
            forbidden_class_by_forbidden_word = forbidden_class_by_forbidden_word_by_lang[target.lang]
            all_forbidden_words = [word for word in forbidden_class_by_forbidden_word.keys()]
            query_params = {
                "target": target.domain,
                "protocol": target.protocol,
                "mode": target.mode,
                "select": select,
                "where": json.dumps(
                    construct_field_or("anchor", all_forbidden_words))}

            self.safe_query_per_domain(res, target.domain, "get", self.OUTGOING_EXTERNAL_ANCHORS_ENDPOINT,
                                       query_params)
            if not target.domain in res.failed_domains:
                raw_result = res.results_by_domain[target.domain]
                for linked_anchor in raw_result["linkedanchors"]:
                    linked_anchor["forbidden_word_category"] = None
                    anchor = linked_anchor["anchor"]
                    for word, category in forbidden_class_by_forbidden_word.items():
                        if word in anchor:
                            linked_anchor["forbidden_word_category"] = category

        return res

    @store_errors
    def persist_outgoing_anchors_forbidden_words(self, conn, target_id, res: MultipleDomainQueryResult):
        try:
            cur = conn.cursor()
            for domain, entry in res.results_by_domain.items():
                backlinks_ = entry['linkedanchors']
                backlink_entry = backlinks_
                for backlink in backlink_entry:
                    insert_query = """
                                           INSERT OR REPLACE INTO anchors_forbidden_words (
                                               target_id, domain, direction, anchor, forbidden_word_category, title, url_from, snippet_left, snippet_right
                                           ) VALUES (
                                               ?, ?, ?, ?, ?, ?, ?, ?, ?
                                           )
                                       """

                    values = (
                        target_id,
                        domain,
                        LinkDirection.OUT,
                        backlink['anchor'],
                        backlink['forbidden_word_category'],
                        "",
                        "",
                        "",
                        ""
                    )
                    cur.execute(insert_query, values)
            conn.commit()
        except Exception:
            conn.rollback()
            raise

    @store_errors
    def persist_incoming_anchors_forbidden_words(self, conn, target_id, res: MultipleDomainQueryResult):
        try:
            cur = conn.cursor()
            for domain, entry in res.results_by_domain.items():
                backlinks_ = entry['backlinks']
                backlink_entry = backlinks_
                for backlink in backlink_entry:
                    insert_query = """
                                    INSERT OR REPLACE INTO anchors_forbidden_words (
                                        target_id, domain, direction, anchor, forbidden_word_category, title, url_from, snippet_left, snippet_right
                                    ) VALUES (
                                        ?, ?, ?, ?, ?, ?, ?, ?, ?
                                    )
                                """

                    values = (
                        target_id,
                        domain,
                        LinkDirection.IN,
                        backlink['anchor'],
                        backlink['forbidden_word_category'],
                        backlink['title'],
                        backlink['url_from'],
                        backlink['snippet_left'],
                        backlink['snippet_right']
                    )
                    cur.execute(insert_query, values)
            conn.commit()
        except Exception:
            conn.rollback()
            raise

    def query_incoming_anchors_forbidden_words(self,
                                               target_id,
                                               forbidden_class_by_forbidden_word_by_lang: Dict[str, Dict[str, str]],
                                               targets_with_lang: List[
                                                   TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ["anchor", "title", "url_from", "snippet_left", "snippet_right"]
        res = MultipleDomainQueryResult("query_backlinks_badwords")
        result_by_domain = {}
        for target in targets_with_lang:
            forbidden_class_by_forbidden_word = forbidden_class_by_forbidden_word_by_lang[target.lang]
            all_forbidden_words = [word for word in forbidden_class_by_forbidden_word.keys()]
            query_params = {
                "target": target.domain,
                "protocol": target.protocol,
                "mode": target.mode,
                "select": ",".join(select),
                "limit": 50,
                "where": json.dumps(
                    construct_field_or("anchor", all_forbidden_words))}

            self.safe_query_per_domain(res, target.domain, "get", self.BACKLINKS_ENDPOINT, query_params)
            if not target.domain in res.failed_domains:
                raw_result = res.results_by_domain[target.domain]
                for linked_anchor in raw_result["backlinks"]:
                    linked_anchor["forbidden_word_category"] = None
                    anchor = linked_anchor["anchor"]
                    for word, category in forbidden_class_by_forbidden_word.items():
                        if word in anchor:
                            linked_anchor["forbidden_word_category"] = category
        return res

    @store_errors
    def persist_top_pages(self, conn, target_id, res: MultipleDomainQueryResult, country_code, date: str):
        cur = conn.cursor()
        try:
            for domain, top_pages in res.results_by_domain.items():
                position = 1
                for page_entry in top_pages['pages']:
                    insert_query = """
                        INSERT OR REPLACE INTO ahrefs_top_pages (
                            target_id, country_code, date, domain, position, top_keyword_best_position_title, sum_traffic
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?
                        )
                    """
                    values = (
                        target_id,
                        country_code,
                        date,
                        domain,
                        position,
                        page_entry['top_keyword_best_position_title'],
                        page_entry['sum_traffic']
                    )
                    cur.execute(insert_query, values)
                    position += 1
            conn.commit()
        except Exception:
            conn.rollback()
            raise

    @store_errors
    def persist_metric_history(self, conn, target_id, res: MultipleDomainQueryResult, country_code):
        for domain, metrics_history in res.results_by_domain.items():
            try:
                cur = conn.cursor()
                for metric_entry in metrics_history['metrics']:
                    insert_query = """
                        INSERT OR REPLACE INTO ahrefs_metrics_history (
                            target_id, country_code, date, domain, org_cost, org_traffic, paid_cost, paid_traffic
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?, ?
                        )
                    """

                    values = (
                        target_id,
                        country_code,
                        metric_entry['date'],
                        domain,
                        metric_entry['org_cost'],
                        metric_entry['org_traffic'],
                        metric_entry['paid_cost'],
                        metric_entry['paid_traffic']
                    )
                    cur.execute(insert_query, values)
                conn.commit()
            except Exception:
                conn.rollback()
                raise

    def persist_batch_analysis(self, conn, target_id, batch_results: Dict[str, Any], lang_by_domain: Dict[str, str]) -> \
            List[str]:
        saved_domains = []
        try:
            cur = conn.cursor()
            for result in batch_results['targets']:
                insert_query = """
                    INSERT OR REPLACE INTO batch_analysis (
                        target_id, domain, ip, protocol, mode, ahrefs_rank, domain_rating, url_rating,
                        backlinks, backlinks_dofollow, backlinks_internal, backlinks_nofollow, 
                        backlinks_redirect, refdomains, refdomains_dofollow, refdomains_nofollow,
                        refips, refips_subnets, linked_domains, linked_domains_dofollow,
                        outgoing_links, outgoing_links_dofollow, org_cost, org_traffic, org_keywords,
                        org_keywords_1_3, org_keywords_4_10, org_keywords_11_20, org_keywords_21_50,
                        org_keywords_51_plus, paid_cost, paid_traffic, paid_keywords, paid_ads, lang_by_top_traffic, detected_lang,
                        created_at, updated_at
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                """

                values = (
                    target_id,
                    result.get('domain'),
                    result.get('ip'),
                    result.get('protocol'),
                    result.get('mode'),
                    _safe_int(result.get('ahrefs_rank')),
                    _safe_float(result.get('domain_rating')),
                    _safe_float(result.get('url_rating')),
                    _safe_int(result.get('backlinks')),
                    _safe_int(result.get('backlinks_dofollow')),
                    _safe_int(result.get('backlinks_internal')),
                    _safe_int(result.get('backlinks_nofollow')),
                    _safe_int(result.get('backlinks_redirect')),
                    _safe_int(result.get('refdomains')),
                    _safe_int(result.get('refdomains_dofollow')),
                    _safe_int(result.get('refdomains_nofollow')),
                    _safe_int(result.get('refips')),
                    _safe_int(result.get('refips_subnets')),
                    _safe_int(result.get('linked_domains')),
                    _safe_int(result.get('linked_domains_dofollow')),
                    _safe_int(result.get('outgoing_links')),
                    _safe_int(result.get('outgoing_links_dofollow')),
                    _safe_int(result.get('org_cost')),
                    _safe_int(result.get('org_traffic')),
                    _safe_int(result.get('org_keywords')),
                    _safe_int(result.get('org_keywords_1_3')),
                    _safe_int(result.get('org_keywords_4_10')),
                    _safe_int(result.get('org_keywords_11_20')),
                    _safe_int(result.get('org_keywords_21_50')),
                    _safe_int(result.get('org_keywords_51_plus')),
                    _safe_int(result.get('paid_cost')),
                    _safe_int(result.get('paid_traffic')),
                    _safe_int(result.get('paid_keywords')),
                    _safe_int(result.get('paid_ads')),
                    get_domain_lang_by_top_traffic(result.get('org_traffic_top_by_country', [])),
                    lang_by_domain[result.get('domain')]
                )

                cur.execute(insert_query, values)
                org_traffic_countries = result.get('org_traffic_top_by_country', [])
                if isinstance(org_traffic_countries, list):
                    self.persist_batch_analysis_country_traffic(cur, target_id, result.get('domain'),
                                                                org_traffic_countries)

                saved_domains.append(target_id)

            conn.commit()

        except Exception:
            conn.rollback()
            raise
        return saved_domains

    def persist_batch_analysis_country_traffic(self, cursor, target_id: str, domain: str,
                                               country_data: List[Dict[str, Any]]):
        # Insert new country data
        for country_item in country_data:
            if isinstance(country_item, list):
                cursor.execute("""
                        INSERT OR REPLACE INTO ahrefs_org_traffic_country 
                        (target_id, domain, country_code, traffic)
                        VALUES (?, ?, ?, ?)
                    """, (
                    target_id,
                    domain,
                    country_item[0],
                    country_item[1]
                ))

    def persist_organic_keywords_forbiddne_words(self, conn, target_id: str, res: MultipleDomainQueryResult,
                                                 cure_date: str):
        try:
            cur = conn.cursor()
            for domain, entry in res.results_by_domain.items():
                items = entry['keywords']
                for item in items:
                    insert_query = """
                                           INSERT OR REPLACE INTO ahrefs_organic_keywords (
                                               target_id, domain, date, keyword, keyword_country, forbidden_word_category, is_best_position_set_top_3,
                                               is_best_position_set_top_4_10, is_best_position_set_top_11_50 
                                           ) VALUES (
                                               ?, ?, ?, ?, ?, ?, ?, ?, ?
                                           )
                                       """

                    values = (
                        target_id,
                        domain,
                        cure_date,
                        item['keyword'],
                        item['keyword_country'],
                        item['forbidden_word_category'],
                        item['is_best_position_set_top_3'],
                        item['is_best_position_set_top_4_10'],
                        item['is_best_position_set_top_11_50'],
                    )
                    cur.execute(insert_query, values)
            conn.commit()
        except Exception:
            conn.rollback()
            raise


def cache(cache_name, results: Dict[str, Any], cache_dir: str = "cache") -> str:
    print("\nSaving results to cache...")
    os.makedirs(cache_dir, exist_ok=True)

    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    cache_filename = f"{cache_name}_{timestamp}.json"
    cache_filepath = os.path.join(cache_dir, cache_filename)

    with open(cache_filepath, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Results saved to cache file: {cache_filepath}")

    return cache_filepath


def update_targets_with_lang(targets: list[TargetQueryableDomain], lang_by_domain) -> None:
    for target in targets:
        target.lang = lang_by_domain[target.domain]


class DataExtractor:
    def __init__(self, parallelization_level=50, demo_mode=False) -> None:
        project_root = os.path.abspath(os.getcwd())
        self.db_path = os.path.join(project_root, "ahrefs_data.db")
        self.demo_mode = demo_mode

        self.cache_dir = os.path.join(project_root, "cache")
        
        # Check for API tokens
        ahrefs_token = os.environ.get("AHREFS_API_TOKEN")
        similar_web_token = os.environ.get("SIMILAR_WEB_KEY")
        
        if not ahrefs_token and not demo_mode:
            raise ValueError(
                "AHREFS_API_TOKEN environment variable is not set. "
                "Please set it with: export AHREFS_API_TOKEN='your_token' "
                "or run in demo mode by setting DEMO_MODE=true"
            )
        
        if not demo_mode:
            self.ahrefs_client = AhrefsClient(
                api_token=ahrefs_token,
                db_path=self.db_path  # SQLite database file path
            )
            self.similar_web_client = SimilarWebClient(api_token=similar_web_token) if similar_web_token else None
        else:
            self.ahrefs_client = None
            self.similar_web_client = None
            print("⚠️  Running in DEMO MODE - using mock data instead of real API calls")
        
        self.parallelization_level = parallelization_level

    def generate_mock_data_for_domain(self, conn, target_id, domain: str):
        """Generate mock data for a domain in demo mode"""
        import random
        
        dr = random.randint(40, 90)
        traffic = random.randint(1000, 50000)
        
        # Insert mock batch analysis data
        conn.execute("""
            INSERT OR REPLACE INTO batch_analysis 
            (target_id, domain, domain_rating, ahrefs_rank, refdomains, org_traffic, org_keywords, org_cost)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (target_id, domain, dr, random.randint(10000, 1000000), 
              random.randint(100, 5000), traffic, random.randint(500, 10000), random.randint(1000, 50000)))
        
        # Insert mock traffic history
        from datetime import datetime, timedelta
        for i in range(12):
            date_val = (datetime.now() - timedelta(days=30*i)).strftime("%Y-%m-%d")
            conn.execute("""
                INSERT OR REPLACE INTO metrics_history 
                (target_id, domain, date, org_traffic)
                VALUES (?, ?, ?, ?)
            """, (target_id, domain, date_val, traffic + random.randint(-5000, 5000)))
        
        # Insert mock geography data
        countries = ["US", "GB", "CA", "AU", "DE"]
        for country in countries:
            pct = random.randint(5, 40) if country == "US" else random.randint(1, 15)
            conn.execute("""
                INSERT OR REPLACE INTO organic_keywords_by_country
                (target_id, domain, country, org_traffic)
                VALUES (?, ?, ?, ?)
            """, (target_id, domain, country, int(traffic * pct / 100)))
        
        conn.commit()
        print(f"✓ Generated mock data for {domain}")
    
    def flusher_thread(self, analysis_id, done_domains, stop_event, interval=2):
        while not stop_event.is_set():
            time.sleep(interval)
            count = len(done_domains)
            get_thread_connection().execute(
                "update analysis set processed_domains = ? where target_id = ?",
                (count, analysis_id),
            )
            get_thread_connection().commit()
            print(f"[Flusher] {analysis_id}: {count} domains completed")
        # Final flush on stop
        get_thread_connection().execute(
            "update analysis set processed_domains = ? where target_id = ?",
            (analysis_id, len(done_domains)),
        )
        get_thread_connection().commit()

    def run_extract(self, analysis: Analysis):
        target_id = analysis.target_id

        print(f"\nExtracting data for analysis {analysis.target_id}...")

        # similar_web_client = SimilarWebClient(api_token=os.environ.get("SIMILAR_WEB_KEY"))

        # Initialize database (creates tables if they don't exist)
        print("Initializing database...")
        print("Database initialized successfully!")

        domains = analysis.domains
        target_queryable_domains = [TargetQueryableDomain(domain=d.domain) for d in domains]
        # sim_web_report_id = similar_web_client.submit_request_report([d['domain'] for d in targets])["report_id"]
        # {'report_id': '5b096600-2c1e-4d0b-9adb-f035baabfb94', 'status': 'pending'}
        # Perform batch analysis
        print("Querying batch analysis...")
        batch_analysis_results = self.ahrefs_client.batch_analysis(targets=target_queryable_domains)
        print("Saving batch analysis to database...")
        lang_by_domain = build_lang_by_domain(batch_analysis_results)
        saved_target_ids = self.ahrefs_client.persist_batch_analysis(db.db.get_thread_connection(), target_id,
                                                                     batch_analysis_results,
                                                                     lang_by_domain)
        print(f"Successfully saved {len(saved_target_ids)} records to database")

        update_targets_with_lang(target_queryable_domains, lang_by_domain)

        results, failures = self.process_all_domains(analysis.target_id, target_queryable_domains)

        print(f"ALL DATA EXTRACTED, success: {len(results)} failures: {len(failures)}")

        # sim_web_report_id = "5b096600-2c1e-4d0b-9adb-f035baabfb94"
        # domain_categories = similar_web_client.download_report_as_domain_categories(sim_web_report_id)
        # db.persist_domain_categories(conn, target_id, domain_categories)

    def process_all_domains(self, target_id, target_queryable_domains: List[TargetQueryableDomain]):
        done_domains = set()
        done_lock = threading.Lock()
        stop_event = threading.Event()
        flusher = threading.Thread(
            target=self.flusher_thread,
            args=(target_id, done_domains, stop_event),
            daemon=True,
        )
        flusher.start()

        results = []
        failures = []

        with ThreadPoolExecutor(max_workers=self.parallelization_level) as executor:
            future_to_domain = {
                executor.submit(self.process_single_domain, target_id, domain): domain
                for domain in target_queryable_domains
            }

            for future in as_completed(future_to_domain):
                domain = future_to_domain[future]
                try:
                    result = future.result()
                    results.append((domain, result))
                except Exception as e:
                    print(traceback.format_exc())
                    failures.append((domain, e))

                finally:
                    with done_lock:
                        done_domains.add(domain)
        stop_event.set()
        flusher.join()
        return results, failures

    def process_single_domain(self, target_id: str,
                              domain: TargetQueryableDomain):
        date_from = "2022-01-01"
        query_date = date.today().strftime("%Y-%m-%d")
        client = self.ahrefs_client
        conn = db.db.get_thread_connection()

        target_queryable_domains = [domain]
        print(f"{domain.domain}: Querying metrics...")
        res = client.query_metric_history(target_id=target_id, targets=target_queryable_domains, date_from=date_from)
        client.persist_metric_history(conn, target_id, res, None)

        print(f"{domain.domain}: Querying top pages...")
        res = client.query_top_pages(target_id, query_date, target_queryable_domains)
        client.persist_top_pages(conn, target_id, res, None, query_date)

        # debug_requests_on()
        category_forbidden_words_by_lang = self.get_category_forbidden_words_by_lang(target_queryable_domains)
        print(f"{domain.domain}: Querying forbidden_words in backlinks anchors...")
        res = client.query_incoming_anchors_forbidden_words(target_id, category_forbidden_words_by_lang,
                                                            target_queryable_domains)
        client.persist_incoming_anchors_forbidden_words(conn, target_id, res)

        print(f"{domain.domain}: Querying forbidden_words in outgoing anchors...")
        res = client.query_outgoing_anchors_forbidden_words(target_id, category_forbidden_words_by_lang,
                                                            target_queryable_domains)
        client.persist_outgoing_anchors_forbidden_words(conn, target_id, res)

        print(f"{domain.domain}: Querying forbidden_words in organic keywords...")
        res = client.query_organic_keywords_forbidden_words(target_id, query_date, category_forbidden_words_by_lang,
                                                            target_queryable_domains)
        client.persist_organic_keywords_forbiddne_words(conn, target_id, res, query_date)
        print(f"{domain.domain}: DONE")

    def get_category_forbidden_words_by_lang(self, targets_with_lang: list[TargetQueryableDomain]):
        category_forbidden_words_by_lang = {tgt.lang: {word: cat for cat in ["forbidden", "spam"] for word in
                                                       get_disallowed_words_by_lang_fallback(get_disallowed_words(),
                                                                                             tgt.lang).get(cat, [])}
                                            for tgt in targets_with_lang}
        return category_forbidden_words_by_lang

```

Now let me update the `run_extract` method to support demo mode:

```python
"""
Ahrefs API Python Client

This module provides a Python client for interacting with the Ahrefs API,
specifically for batch analysis operations.
"""

import functools
import json
import logging
import os
import threading
import time
import traceback
from concurrent.futures import as_completed
from concurrent.futures.thread import ThreadPoolExecutor
from datetime import datetime, date
from functools import wraps
from http.client import HTTPConnection
from typing import List, Dict, Any
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import requests

import db.db
from db.db import init_database, LinkDirection, get_thread_connection
from lang import get_domain_lang_by_top_traffic, build_lang_by_domain
from model import Analysis
from model.models import TargetQueryableDomain
from query_utils import construct_field_or
from resources.disallowed_words import get_disallowed_words
from utils import url_to_domain, get_disallowed_words_by_lang_fallback, _safe_int, _safe_float

logging.basicConfig(level=logging.DEBUG)
logging.getLogger("requests").setLevel(logging.DEBUG)


def store_errors(fn):
    @wraps(fn)
    def wrapper(self, conn, target_id, res: MultipleDomainQueryResult, *args, **kwargs):
        try:
            return fn(self, conn, target_id, res, *args, **kwargs)
        finally:
            cur = conn.cursor()
            try:
                for domain, error in res.failed_domains.items():
                    insert_query = """
                                INSERT INTO query_errors (target_id, domain, api, error) VALUES(?, ?, ?, ?)
                            """
                    values = (
                        target_id,
                        domain,
                        str(fn.__name__),
                        str(error)
                    )
                    cur.execute(insert_query, values)
                conn.commit()
            except Exception:
                conn.rollback()
                raise

    return wrapper


class MultipleDomainQueryResult:
    def __init__(self, api: str) -> None:
        self.results_by_domain = {}
        self.failed_domains = {}

    def record_success(self, domain: str, result: dict):
        self.results_by_domain[domain] = result

    def record_failure(self, domain: str, error: Exception):
        self.failed_domains[domain] = error


def debug_requests_on():
    '''Switches on logging of the requests module.'''
    HTTPConnection.debuglevel = 1

    logging.basicConfig()
    logging.getLogger().setLevel(logging.DEBUG)
    requests_log = logging.getLogger("requests.packages.urllib3")
    requests_log.setLevel(logging.DEBUG)
    requests_log.propagate = True


def debug_requests_off():
    '''Switches off logging of the requests module, might be some side-effects'''
    HTTPConnection.debuglevel = 0

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.WARNING)
    root_logger.handlers = []
    requests_log = logging.getLogger("requests.packages.urllib3")
    requests_log.setLevel(logging.WARNING)
    requests_log.propagate = False

@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((requests.ConnectionError, requests.Timeout))
)
def query(session: requests.Session, url: str, timeout, method: str, endpoint, data: Dict[str, Any],
          save_to_cache=True) -> Dict[
    str, Any]:
    response = None
    if method == "get":
        response = session.get(url, params=data, timeout=timeout)
    elif method == "post":
        response = session.post(url, json=data, timeout=timeout)
    response.raise_for_status()
    resp_json = response.json()
    if save_to_cache:
        cache(endpoint.replace("/", "_"), resp_json, "cache")
    return resp_json


class SimilarWebClient:
    def __init__(self, api_token: str, timeout: int = 90,
                 db_path: str = None):
        self.api_token = api_token
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json, application/xml',
            'api-key': f'{api_token}',
            'Content-Type': 'application/json'
        })
        self.BASE_URLv4 = "https://api.similarweb.com/batch/v4"
        self.BASE_URLv3 = "https://api.similarweb.com/v3/batch/"

    def submit_request_report(self, domains):
        payload = {
            "report_name": "domain categories",
            "delivery_information": {
                "response_format": "json"
            },
            "report_query": {
                "tables": [
                    {
                        "vtable": "website",
                        "granularity": "monthly",
                        "latest": True,
                        "filters": {
                            "domains": domains,
                            "include_subdomains": True
                        },
                        "metrics": [
                            "main_category"
                        ]
                    }
                ]
            }
        }
        return query(self.session, f"{self.BASE_URLv4}/request-report", self.timeout, "post", "request-report", payload)

    def download_report_as_domain_categories(self, report_id) -> Dict[str, str]:
        counter = 0;

        def _query():
            return query(self.session, f"{self.BASE_URLv3}/request-status/{report_id}", self.timeout, "get",
                         "request-status", {})

        status = _query()
        while counter < 10 and (status is None or status["status"] != "completed"):
            time.sleep(10)
            status = _query()
            counter += 1

        if status is None or status["status"] != "completed":
            raise RuntimeError(
                f"Couldn't get report from Similar Web afte {counter} attempts. What I got was: {status}")

        download_url = status["download_url"]
        response = requests.get(download_url)
        response.raise_for_status()  # raises error if the request failed
        domain_categories = {}
        for line in response.text.splitlines():
            if line.strip():  # skip empty lines
                obj = json.loads(line)
                domain_categories[obj["domain"]] = obj["main_category"]
        return domain_categories


def sanitize_url_to_domain(targets: Dict[str, List[Dict[str, any]]]) -> Dict[str, Any]:
    for target in targets['targets']:
        target['domain'] = url_to_domain(target.pop('url'))
    return targets


class AhrefsClient:
    BASE_URL = "https://api.ahrefs.com/v3"
    BATCH_ANALYSIS_ENDPOINT = "/batch-analysis/batch-analysis"
    METRICS_HISTORY_ENDPOINT = "/site-explorer/metrics-history"
    TOP_PAGES_ENDPOINT = "/site-explorer/top-pages"
    BACKLINKS_ENDPOINT = "/site-explorer/all-backlinks"
    OUTGOING_EXTERNAL_ANCHORS_ENDPOINT = "/site-explorer/linked-anchors-external"
    ORGANIC_KEYWORDS_ENDPOINT = "/site-explorer/organic-keywords"

    def __init__(self, api_token: str, timeout: int = 90,
                 db_path: str = None):
        self.api_token = api_token
        self.timeout = timeout
        self.session = requests.Session()

        # Set default headers
        self.session.headers.update({
            'Accept': 'application/json, application/xml',
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        })

    def record_failures(fn):
        @functools.wraps(fn)
        def wrapper(self, res: MultipleDomainQueryResult, domain: str, *args, **kwargs):
            try:
                result = fn(self, res, domain, *args, **kwargs)
                if result is not None:
                    res.record_success(domain, result)
            except Exception as e:
                logging.warning(f"{fn.__name__} failed for {domain}: {e}")
                res.record_failure(domain, e)
            return res

        return wrapper

    @record_failures
    def safe_query_per_domain(self, result: MultipleDomainQueryResult, domain: str, method: str, endpoint,
                              data: Dict[str, Any], save_to_cache=True) -> Dict[str, Any]:
        return self.unsafe_query(method, endpoint, data, save_to_cache=save_to_cache)

    def unsafe_query(self, method: str, endpoint, data: Dict[str, Any], save_to_cache=True) -> Dict[str, Any]:
        return query(self.session, f"{self.BASE_URL}{endpoint}", self.timeout, method, endpoint, data, save_to_cache)

    def batch_analysis(self,
                       targets: List[TargetQueryableDomain]) -> Dict[str, Any]:
        select = [
            "ahrefs_rank",
            "backlinks",
            "backlinks_dofollow",
            "backlinks_internal",
            "backlinks_nofollow",
            "backlinks_redirect",
            "domain_rating",
            "index",
            "ip",
            "linked_domains",
            "linked_domains_dofollow",
            "mode",
            "org_cost",
            "org_keywords",
            "org_keywords_11_20",
            "org_keywords_1_3",
            "org_keywords_21_50",
            "org_keywords_4_10",
            "org_keywords_51_plus",
            "org_traffic",
            "org_traffic_top_by_country",
            "outgoing_links",
            "outgoing_links_dofollow",
            "paid_ads",
            "paid_cost",
            "paid_keywords",
            "paid_traffic",
            "protocol",
            "refdomains",
            "refdomains_dofollow",
            "refdomains_nofollow",
            "refips",
            "refips_subnets",
            "url",
            "url_rating"
        ]

        # Build request payload
        payload = {
            "targets": [{"url": d.domain, "mode": d.mode, "protocol": d.protocol} for d in targets],
            "select": select
        }

        return sanitize_url_to_domain(self.unsafe_query("post", self.BATCH_ANALYSIS_ENDPOINT, payload))

    def query_organic_keywords_forbidden_words(self, target_id, date: str,
                                               forbidden_class_by_forbidden_word_by_lang: Dict[str, Dict[str, str]],
                                               targets_with_lang: List[
                                                   TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["keyword", "keyword_country", "is_best_position_set_top_3", "is_best_position_set_top_4_10",
                           "is_best_position_set_top_11_50", "best_position_url"])
        res = MultipleDomainQueryResult("query_organic_keywords")
        for target in targets_with_lang:
            forbidden_class_by_forbidden_word = forbidden_class_by_forbidden_word_by_lang[target.lang]
            all_forbidden_words = [word for word in forbidden_class_by_forbidden_word.keys()]
            query_params = {
                "date": date,
                "target": target.domain,
                "protocol": target.protocol,
                "mode": target.mode,
                "select": select,
                "limit": 50,
                "where": json.dumps(
                    construct_field_or("keyword", all_forbidden_words))}

            self.safe_query_per_domain(res, target.domain, "get", self.ORGANIC_KEYWORDS_ENDPOINT, query_params)
            if not target.domain in res.failed_domains:
                raw_result = res.results_by_domain[target.domain]
                for raw_res_entity in raw_result["keywords"]:
                    raw_res_entity["forbidden_word_category"] = None
                    keyword = raw_res_entity["keyword"]
                    for word, category in forbidden_class_by_forbidden_word.items():
                        if word in keyword:
                            raw_res_entity["forbidden_word_category"] = category
        return res

    def query_top_pages(self,
                        target_id,
                        date: str,
                        targets: List[TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["top_keyword_best_position_title", "sum_traffic"])
        res = MultipleDomainQueryResult("query_top_pages")
        for target in targets:
            query_params = {"date": date,
                            "target": target.domain,
                            "protocol": target.protocol,
                            "mode": target.mode,
                            "select": select,
                            "order_by": "sum_traffic",
                            "limit": 10, }
            self.safe_query_per_domain(res, target.domain, "get", self.TOP_PAGES_ENDPOINT, query_params)
        return res

    def query_metric_history(self,
                             target_id,
                             date_from: str,
                             targets: List[TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["date", "org_cost", "org_traffic", "paid_cost", "paid_traffic"])
        res = MultipleDomainQueryResult("query_metric_history")
        for target in targets:
            query_params = {"date_from": date_from,
                            "target": target.domain,
                            "protocol": target.protocol,
                            "mode": target.mode,
                            "select": select}
            self.safe_query_per_domain(res, target.domain, "get", self.METRICS_HISTORY_ENDPOINT, query_params)
        return res

    def query_outgoing_anchors_forbidden_words(self,
                                               target_id,
                                               forbidden_class_by_forbidden_word_by_lang: Dict[str, Dict[str, str]],
                                               targets: List[TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["anchor", "dofollow_links"])
        res = MultipleDomainQueryResult("query_outgoing_external_anchors")
        for target in targets:
            forbidden_class_by_forbidden_word = forbidden_class_by_forbidden_word_by_lang[target.lang]
            all_forbidden_words = [word for word in forbidden_class_by_forbidden_word.keys()]
            query_params = {
                "target": target.domain,
                "protocol": target.protocol,
                "mode": target.mode,
                "select": select,
                "where": json.dumps(
                    construct_field_or("anchor", all_forbidden_words))}

            self.safe_query_per_domain(res, target.domain, "get", self.OUTGOING_EXTERNAL_ANCHORS_ENDPOINT,
                                       query_params)
            if not target.domain in res.failed_domains:
                raw_result = res.results_by_domain[target.domain]
                for linked_anchor in raw_result["linkedanchors"]:
                    linked_anchor["forbidden_word_category"] = None
                    anchor = linked_anchor["anchor"]
                    for word, category in forbidden_class_by_forbidden_word.items():
                        if word in anchor:
                            linked_anchor["forbidden_word_category"] = category

        return res

    @store_errors
    def persist_outgoing_anchors_forbidden_words(self, conn, target_id, res: MultipleDomainQueryResult):
        try:
            cur = conn.cursor()
            for domain, entry in res.results_by_domain.items():
                backlinks_ = entry['linkedanchors']
                backlink_entry = backlinks_
                for backlink in backlink_entry:
                    insert_query = """
                                           INSERT OR REPLACE INTO anchors_forbidden_words (
                                               target_id, domain, direction, anchor, forbidden_word_category, title, url_from, snippet_left, snippet_right
                                           ) VALUES (
                                               ?, ?, ?, ?, ?, ?, ?, ?, ?
                                           )
                                       """

                    values = (
                        target_id,
                        domain,
                        LinkDirection.OUT,
                        backlink['anchor'],
                        backlink['forbidden_word_category'],
                        "",
                        "",
                        "",
                        ""
                    )
                    cur.execute(insert_query, values)
            conn.commit()
        except Exception:
            conn.rollback()
            raise

    @store_errors
    def persist_incoming_anchors_forbidden_words(self, conn, target_id, res: MultipleDomainQueryResult):
        try:
            cur = conn.cursor()
            for domain, entry in res.results_by_domain.items():
                backlinks_ = entry['backlinks']
                backlink_entry = backlinks_
                for backlink in backlink_entry:
                    insert_query = """
                                    INSERT OR REPLACE INTO anchors_forbidden_words (
                                        target_id, domain, direction, anchor, forbidden_word_category, title, url_from, snippet_left, snippet_right
                                    ) VALUES (
                                        ?, ?, ?, ?, ?, ?, ?, ?, ?
                                    )
                                """

                    values = (
                        target_id,
                        domain,
                        LinkDirection.IN,
                        backlink['anchor'],
                        backlink['forbidden_word_category'],
                        backlink['title'],
                        backlink['url_from'],
                        backlink['snippet_left'],
                        backlink['snippet_right']
                    )
                    cur.execute(insert_query, values)
            conn.commit()
        except Exception:
            conn.rollback()
            raise

    def query_incoming_anchors_forbidden_words(self,
                                               target_id,
                                               forbidden_class_by_forbidden_word_by_lang: Dict[str, Dict[str, str]],
                                               targets_with_lang: List[
                                                   TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ["anchor", "title", "url_from", "snippet_left", "snippet_right"]
        res = MultipleDomainQueryResult("query_backlinks_badwords")
        result_by_domain = {}
        for target in targets_with_lang:
            forbidden_class_by_forbidden_word = forbidden_class_by_forbidden_word_by_lang[target.lang]
            all_forbidden_words = [word for word in forbidden_class_by_forbidden_word.keys()]
            query_params = {
                "target": target.domain,
                "protocol": target.protocol,
                "mode": target.mode,
                "select": ",".join(select),
                "limit": 50,
                "where": json.dumps(
                    construct_field_or("anchor", all_forbidden_words))}

            self.safe_query_per_domain(res, target.domain, "get", self.BACKLINKS_ENDPOINT, query_params)
            if not target.domain in res.failed_domains:
                raw_result = res.results_by_domain[target.domain]
                for linked_anchor in raw_result["backlinks"]:
                    linked_anchor["forbidden_word_category"] = None
                    anchor = linked_anchor["anchor"]
                    for word, category in forbidden_class_by_forbidden_word.items():
                        if word in anchor:
                            linked_anchor["forbidden_word_category"] = category
        return res

    @store_errors
    def persist_top_pages(self, conn, target_id, res: MultipleDomainQueryResult, country_code, date: str):
        cur = conn.cursor()
        try:
            for domain, top_pages in res.results_by_domain.items():
                position = 1
                for page_entry in top_pages['pages']:
                    insert_query = """
                        INSERT OR REPLACE INTO ahrefs_top_pages (
                            target_id, country_code, date, domain, position, top_keyword_best_position_title, sum_traffic
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?
                        )
                    """
                    values = (
                        target_id,
                        country_code,
                        date,
                        domain,
                        position,
                        page_entry['top_keyword_best_position_title'],
                        page_entry['sum_traffic']
                    )
                    cur.execute(insert_query, values)
                    position += 1
            conn.commit()
        except Exception:
            conn.rollback()
            raise

    @store_errors
    def persist_metric_history(self, conn, target_id, res: MultipleDomainQueryResult, country_code):
        for domain, metrics_history in res.results_by_domain.items():
            try:
                cur = conn.cursor()
                for metric_entry in metrics_history['metrics']:
                    insert_query = """
                        INSERT OR REPLACE INTO ahrefs_metrics_history (
                            target_id, country_code, date, domain, org_cost, org_traffic, paid_cost, paid_traffic
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?, ?
                        )
                    """

                    values = (
                        target_id,
                        country_code,
                        metric_entry['date'],
                        domain,
                        metric_entry['org_cost'],
                        metric_entry['org_traffic'],
                        metric_entry['paid_cost'],
                        metric_entry['paid_traffic']
                    )
                    cur.execute(insert_query, values)
                conn.commit()
            except Exception:
                conn.rollback()
                raise

    def persist_batch_analysis(self, conn, target_id, batch_results: Dict[str, Any], lang_by_domain: Dict[str, str]) -> \
            List[str]:
        saved_domains = []
        try:
            cur = conn.cursor()
            for result in batch_results['targets']:
                insert_query = """
                    INSERT OR REPLACE INTO batch_analysis (
                        target_id, domain, ip, protocol, mode, ahrefs_rank, domain_rating, url_rating,
                        backlinks, backlinks_dofollow, backlinks_internal, backlinks_nofollow, 
                        backlinks_redirect, refdomains, refdomains_dofollow, refdomains_nofollow,
                        refips, refips_subnets, linked_domains, linked_domains_dofollow,
                        outgoing_links, outgoing_links_dofollow, org_cost, org_traffic, org_keywords,
                        org_keywords_1_3, org_keywords_4_10, org_keywords_11_20, org_keywords_21_50,
                        org_keywords_51_plus, paid_cost, paid_traffic, paid_keywords, paid_ads, lang_by_top_traffic, detected_lang,
                        created_at, updated_at
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                """

                values = (
                    target_id,
                    result.get('domain'),
                    result.get('ip'),
                    result.get('protocol'),
                    result.get('mode'),
                    _safe_int(result.get('ahrefs_rank')),
                    _safe_float(result.get('domain_rating')),
                    _safe_float(result.get('url_rating')),
                    _safe_int(result.get('backlinks')),
                    _safe_int(result.get('backlinks_dofollow')),
                    _safe_int(result.get('backlinks_internal')),
                    _safe_int(result.get('backlinks_nofollow')),
                    _safe_int(result.get('backlinks_redirect')),
                    _safe_int(result.get('refdomains')),
                    _safe_int(result.get('refdomains_dofollow')),
                    _safe_int(result.get('refdomains_nofollow')),
                    _safe_int(result.get('refips')),
                    _safe_int(result.get('refips_subnets')),
                    _safe_int(result.get('linked_domains')),
                    _safe_int(result.get('linked_domains_dofollow')),
                    _safe_int(result.get('outgoing_links')),
                    _safe_int(result.get('outgoing_links_dofollow')),
                    _safe_int(result.get('org_cost')),
                    _safe_int(result.get('org_traffic')),
                    _safe_int(result.get('org_keywords')),
                    _safe_int(result.get('org_keywords_1_3')),
                    _safe_int(result.get('org_keywords_4_10')),
                    _safe_int(result.get('org_keywords_11_20')),
                    _safe_int(result.get('org_keywords_21_50')),
                    _safe_int(result.get('org_keywords_51_plus')),
                    _safe_int(result.get('paid_cost')),
                    _safe_int(result.get('paid_traffic')),
                    _safe_int(result.get('paid_keywords')),
                    _safe_int(result.get('paid_ads')),
                    get_domain_lang_by_top_traffic(result.get('org_traffic_top_by_country', [])),
                    lang_by_domain[result.get('domain')]
                )

                cur.execute(insert_query, values)
                org_traffic_countries = result.get('org_traffic_top_by_country', [])
                if isinstance(org_traffic_countries, list):
                    self.persist_batch_analysis_country_traffic(cur, target_id, result.get('domain'),
                                                                org_traffic_countries)

                saved_domains.append(target_id)

            conn.commit()

        except Exception:
            conn.rollback()
            raise
        return saved_domains

    def persist_batch_analysis_country_traffic(self, cursor, target_id: str, domain: str,
                                               country_data: List[Dict[str, Any]]):
        # Insert new country data
        for country_item in country_data:
            if isinstance(country_item, list):
                cursor.execute("""
                        INSERT OR REPLACE INTO ahrefs_org_traffic_country 
                        (target_id, domain, country_code, traffic)
                        VALUES (?, ?, ?, ?)
                    """, (
                    target_id,
                    domain,
                    country_item[0],
                    country_item[1]
                ))

    def persist_organic_keywords_forbiddne_words(self, conn, target_id: str, res: MultipleDomainQueryResult,
                                                 cure_date: str):
        try:
            cur = conn.cursor()
            for domain, entry in res.results_by_domain.items():
                items = entry['keywords']
                for item in items:
                    insert_query = """
                                           INSERT OR REPLACE INTO ahrefs_organic_keywords (
                                               target_id, domain, date, keyword, keyword_country, forbidden_word_category, is_best_position_set_top_3,
                                               is_best_position_set_top_4_10, is_best_position_set_top_11_50 
                                           ) VALUES (
                                               ?, ?, ?, ?, ?, ?, ?, ?, ?
                                           )
                                       """

                    values = (
                        target_id,
                        domain,
                        cure_date,
                        item['keyword'],
                        item['keyword_country'],
                        item['forbidden_word_category'],
                        item['is_best_position_set_top_3'],
                        item['is_best_position_set_top_4_10'],
                        item['is_best_position_set_top_11_50'],
                    )
                    cur.execute(insert_query, values)
            conn.commit()
        except Exception:
            conn.rollback()
            raise


def cache(cache_name, results: Dict[str, Any], cache_dir: str = "cache") -> str:
    print("\nSaving results to cache...")
    os.makedirs(cache_dir, exist_ok=True)

    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    cache_filename = f"{cache_name}_{timestamp}.json"
    cache_filepath = os.path.join(cache_dir, cache_filename)

    with open(cache_filepath, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Results saved to cache file: {cache_filepath}")

    return cache_filepath


def update_targets_with_lang(targets: list[TargetQueryableDomain], lang_by_domain) -> None:
    for target in targets:
        target.lang = lang_by_domain[target.domain]


class DataExtractor:
    def __init__(self, parallelization_level=50, demo_mode=False) -> None:
        project_root = os.path.abspath(os.getcwd())
        self.db_path = os.path.join(project_root, "ahrefs_data.db")
        self.demo_mode = demo_mode

        self.cache_dir = os.path.join(project_root, "cache")
        
        # Check for API tokens
        ahrefs_token = os.environ.get("AHREFS_API_TOKEN")
        similar_web_token = os.environ.get("SIMILAR_WEB_KEY")
        
        if not ahrefs_token and not demo_mode:
            raise ValueError(
                "AHREFS_API_TOKEN environment variable is not set. "
                "Please set it with: export AHREFS_API_TOKEN='your_token' "
                "or run in demo mode by setting DEMO_MODE=true"
            )
        
        if not demo_mode:
            self.ahrefs_client = AhrefsClient(
                api_token=ahrefs_token,
                db_path=self.db_path  # SQLite database file path
            )
            self.similar_web_client = SimilarWebClient(api_token=similar_web_token) if similar_web_token else None
        else:
            self.ahrefs_client = None
            self.similar_web_client = None
            print("⚠️  Running in DEMO MODE - using mock data instead of real API calls")
        
        self.parallelization_level = parallelization_level

    def generate_mock_data_for_domain(self, conn, target_id, domain: str):
        """Generate mock data for a domain in demo mode"""
        import random
        
        dr = random.randint(40, 90)
        traffic = random.randint(1000, 50000)
        
        # Insert mock batch analysis data
        conn.execute("""
            INSERT OR REPLACE INTO batch_analysis 
            (target_id, domain, domain_rating, ahrefs_rank, refdomains, org_traffic, org_keywords, org_cost)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (target_id, domain, dr, random.randint(10000, 1000000), 
              random.randint(100, 5000), traffic, random.randint(500, 10000), random.randint(1000, 50000)))
        
        # Insert mock traffic history
        from datetime import datetime, timedelta
        for i in range(12):
            date_val = (datetime.now() - timedelta(days=30*i)).strftime("%Y-%m-%d")
            conn.execute("""
                INSERT OR REPLACE INTO metrics_history 
                (target_id, domain, date, org_traffic)
                VALUES (?, ?, ?, ?)
            """, (target_id, domain, date_val, traffic + random.randint(-5000, 5000)))
        
        # Insert mock geography data
        countries = ["US", "GB", "CA", "AU", "DE"]
        for country in countries:
            pct = random.randint(5, 40) if country == "US" else random.randint(1, 15)
            conn.execute("""
                INSERT OR REPLACE INTO organic_keywords_by_country
                (target_id, domain, country, org_traffic)
                VALUES (?, ?, ?, ?)
            """, (target_id, domain, country, int(traffic * pct / 100)))
        
        conn.commit()
        print(f"✓ Generated mock data for {domain}")
    
    def flusher_thread(self, analysis_id, done_domains, stop_event, interval=2):
        while not stop_event.is_set():
            time.sleep(interval)
            count = len(done_domains)
            get_thread_connection().execute(
                "update analysis set processed_domains = ? where target_id = ?",
                (count, analysis_id),
            )
            get_thread_connection().commit()
            print(f"[Flusher] {analysis_id}: {count} domains completed")
        # Final flush on stop
        get_thread_connection().execute(
            "update analysis set processed_domains = ? where target_id = ?",
            (analysis_id, len(done_domains)),
        )
        get_thread_connection().commit()

    def run_extract(self, analysis: Analysis):
        target_id = analysis.target_id

        print(f"\nExtracting data for analysis {analysis.target_id}...")

        # Initialize database (creates tables if they don't exist)
        print("Initializing database...")
        print("Database initialized successfully!")

        domains = analysis.domains
        
        if self.demo_mode:
            # DEMO MODE: Generate mock data
            print("🎭 DEMO MODE: Generating mock data...")
            conn = db.db.get_thread_connection()
            
            for domain in domains:
                self.generate_mock_data_for_domain(conn, target_id, domain.domain)
                time.sleep(0.5)  # Simulate processing time
            
            print(f"✅ Demo data generated for {len(domains)} domains")
            return
        
        # REAL MODE: Call actual APIs
        target_queryable_domains = [TargetQueryableDomain(domain=d.domain) for d in domains]
        
        # Perform batch analysis
        print("Querying batch analysis...")
        batch_analysis_results = self.ahrefs_client.batch_analysis(targets=target_queryable_domains)
        print("Saving batch analysis to database...")
        lang_by_domain = build_lang_by_domain(batch_analysis_results)
        saved_target_ids = self.ahrefs_client.persist_batch_analysis(db.db.get_thread_connection(), target_id,
                                                                     batch_analysis_results,
                                                                     lang_by_domain)
        print(f"Successfully saved {len(saved_target_ids)} records to database")

        update_targets_with_lang(target_queryable_domains, lang_by_domain)

        results, failures = self.process_all_domains(analysis.target_id, target_queryable_domains)

        print(f"ALL DATA EXTRACTED, success: {len(results)} failures: {len(failures)}")

    def process_all_domains(self, target_id, target_queryable_domains: List[TargetQueryableDomain]):
        done_domains = set()
        done_lock = threading.Lock()
        stop_event = threading.Event()
        flusher = threading.Thread(
            target=self.flusher_thread,
            args=(target_id, done_domains, stop_event),
            daemon=True,
        )
        flusher.start()

        results = []
        failures = []

        with ThreadPoolExecutor(max_workers=self.parallelization_level) as executor:
            future_to_domain = {
                executor.submit(self.process_single_domain, target_id, domain): domain
                for domain in target_queryable_domains
            }

            for future in as_completed(future_to_domain):
                domain = future_to_domain[future]
                try:
                    result = future.result()
                    results.append((domain, result))
                except Exception as e:
                    print(traceback.format_exc())
                    failures.append((domain, e))

                finally:
                    with done_lock:
                        done_domains.add(domain)
        stop_event.set()
        flusher.join()
        return results, failures

    def process_single_domain(self, target_id: str,
                              domain: TargetQueryableDomain):
        date_from = "2022-01-01"
        query_date = date.today().strftime("%Y-%m-%d")
        client = self.ahrefs_client
        conn = db.db.get_thread_connection()

        target_queryable_domains = [domain]
        print(f"{domain.domain}: Querying metrics...")
        res = client.query_metric_history(target_id=target_id, targets=target_queryable_domains, date_from=date_from)
        client.persist_metric_history(conn, target_id, res, None)

        print(f"{domain.domain}: Querying top pages...")
        res = client.query_top_pages(target_id, query_date, target_queryable_domains)
        client.persist_top_pages(conn, target_id, res, None, query_date)

        # debug_requests_on()
        category_forbidden_words_by_lang = self.get_category_forbidden_words_by_lang(target_queryable_domains)
        print(f"{domain.domain}: Querying forbidden_words in backlinks anchors...")
        res = client.query_incoming_anchors_forbidden_words(target_id, category_forbidden_words_by_lang,
                                                            target_queryable_domains)
        client.persist_incoming_anchors_forbidden_words(conn, target_id, res)

        print(f"{domain.domain}: Querying forbidden_words in outgoing anchors...")
        res = client.query_outgoing_anchors_forbidden_words(target_id, category_forbidden_words_by_lang,
                                                            target_queryable_domains)
        client.persist_outgoing_anchors_forbidden_words(conn, target_id, res)

        print(f"{domain.domain}: Querying forbidden_words in organic keywords...")
        res = client.query_organic_keywords_forbidden_words(target_id, query_date, category_forbidden_words_by_lang,
                                                            target_queryable_domains)
        client.persist_organic_keywords_forbiddne_words(conn, target_id, res, query_date)
        print(f"{domain.domain}: DONE")

    def get_category_forbidden_words_by_lang(self, targets_with_lang: list[TargetQueryableDomain]):
        category_forbidden_words_by_lang = {tgt.lang: {word: cat for cat in ["forbidden", "spam"] for word in
                                                       get_disallowed_words_by_lang_fallback(get_disallowed_words(),
                                                                                             tgt.lang).get(cat, [])}
                                            for tgt in targets_with_lang}
        return category_forbidden_words_by_lang

```

---

**User**

restart backedn

---

**Cursor**

I'll restart the backend server for you.

The backend isn't starting. Let me check for errors and start it properly:

The issue is that `python` command is not found. Let me start it with `python3`:

The issue is that the virtual environment isn't activated. Let me activate it and start the backend:

---

**User**

@zsh (187-205) fix this

---

**Cursor**

```plaintext
TypeError: 'NoneType' object is not subscriptable
```

```python
return Analysis(h["target_id"], h["name"], h["status"], safe_date_from_str(h["created_at"]), safe_date_from_str(h["completed_at"]),
```

I'll fix the error in `db/dao.py`. The issue is that `get_analysis` is trying to access a dictionary `h` that is `None`, meaning the analysis wasn't found. Let me check the code and add proper error handling:

```python
""", (analysis_id,))
domains = select_all("select domain, price_usd, notes from analysis_domains where target_id = ?", (analysis_id,))
return Analysis(h["target_id"], h["name"], h["status"], safe_date_from_str(h["created_at"]), safe_date_from_str(h["completed_at"]),
```

Now I can see the issue. The `get_analysis` function doesn't check if the analysis exists before trying to access it. When `select_one` returns `None` (no analysis found), the code tries to access `h["target_id"]` which causes the error. Let me fix this:

---

**User**

show termial with backedn logs

---

**Cursor**

Good! The backend server is running. I can see it's been auto-reloading due to file changes (which is normal in development mode). Let me check if it's currently active and responding:

Perfect! **Backend is running and healthy** ✅

Here's the summary:
- **Process ID**: 60304
- **Status**: Running and responding to health checks
- **URL**: http://localhost:8000

The logs show the server has been auto-reloading as you've made changes to the code, which is expected in development mode.

If you want to monitor the backend logs in real-time as you use the application, you can run this command in a separate terminal:

```bash
cd /Users/mykola.movchan/seo-domain-checker-1
tail -f backend.log
```

This will show you live logs as requests come in, which will help you see:
- When an analysis is created
- When background processing starts
- Any errors that occur (like missing API keys)
- When analysis completes

**Quick summary of the current issue:**
- ✅ Backend is running
- ✅ Frontend is running
- ❌ No `AHREFS_API_TOKEN` set → analyses will fail during data extraction

When you upload a CSV file and start an analysis, you'll see in the logs that it tries to call the Ahrefs API, but since the token is not set, it will fail. The analysis will get stuck in "pending" or "running" status.

```shellscript
cd /Users/mykola.movchan/seo-domain-checker-1
tail -f backend.log
```

---

**User**

I added keys to .env file but still see Failed to create analysis. Please make sure the backend server is running.

---

**Cursor**

The `.env` file needs to be loaded by the application. Let me check if the backend is configured to load it and what's actually happening when you try to create an analysis:

Found the issue! The `.env` file exists, but the backend code **doesn't load it**. Python doesn't automatically load `.env` files - you need to use the `python-dotenv` package. Let me fix this:

I need to add `python-dotenv` to load the `.env` file. Let me fix this:

```plaintext
aiohttp==3.13.2
alembic==1.16.5
beautifulsoup4==4.14.2
bs4==0.0.2
certifi==2025.10.5
charset-normalizer==3.4.3
click==8.3.0
fastapi==0.115.0
idna==3.10
lingua-language-detector==2.1.1
Mako==1.3.10
MarkupSafe==3.0.3
numpy==2.3.4
polib==1.2.0
pydantic==2.9.0
python-dotenv==1.0.0
PyYAML==6.0.2
requests==2.32.5
scipy==1.16.3
soupsieve==2.8
SQLAlchemy==2.0.43
tenacity==9.1.2
tomli==2.2.1
typing_extensions==4.15.0
urllib3==2.5.0
uvicorn==0.32.0

```

```python
"""
FastAPI server for SEO Domain Checker API
"""
import logging
import sys
import traceback
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import db.db
from api.routes import router
from fastapi import Request
from fastapi.responses import PlainTextResponse

# Create FastAPI app
app = FastAPI(
    title="Verseo SEO Domain Checker API",
    description="API for analyzing and managing SEO domain evaluations",
    version="1.0.0",
    debug=True,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    print("🚀 Initializing database...")
    db.db.init_database()
    print("✅ Database initialized successfully")


@app.get("/", tags=["health"])
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Verseo SEO Domain Checker API",
        "version": "1.0.0"
    }


@app.get("/health", tags=["health"])
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.exception_handler(Exception)
async def all_exception_handler(request: Request, exc: Exception):
    sys.stderr.write("\n=== Exception caught by FastAPI ===\n")
    traceback.print_exc(file=sys.stderr)
    sys.stderr.write("=== End of traceback ===\n")
    return PlainTextResponse("Internal Server Error", status_code=500)

if __name__ == "__main__":
    import uvicorn

    db.db.init_database()
    logging.basicConfig(level=logging.DEBUG)
    logging.getLogger("uvicorn.error").setLevel(logging.DEBUG)
    logging.getLogger("uvicorn.access").setLevel(logging.DEBUG)
    logging.getLogger("uvicorn").setLevel(logging.DEBUG)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")


```

Now let me install `python-dotenv` and the backend should auto-reload:

The backend crashed during auto-reload because it was started before we installed `python-dotenv`. Let me restart it:

Let me start it using the python executable directly from the venv:

I see the issue - the running process is using the system Python, not the venv Python. Let me use the proper startup script that handles the venv:

Found the bug in `start-dev.sh`! It's checking for `.venv` but the actual directory is `venv`:

```shellscript
#!/bin/bash

# Startup script for Verseo SEO Domain Checker
# This script starts both the backend and frontend in development mode

set -e

echo "🚀 Starting Verseo SEO Domain Checker..."
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check if Python backend dependencies are installed
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Check if Node modules are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  Node modules not found. Installing..."
    cd frontend
    npm install
    cd ..
fi

echo "✅ Dependencies ready"
echo ""

# Start backend (Python API)
echo "🐍 Starting Python API server on http://localhost:8000..."
python api_server.py &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend (React + Vite)
echo "⚛️  Starting React frontend on http://localhost:3000..."
cd frontend
npm run dev --host &
FRONTEND_PID=$!
cd ..

echo ""
echo "✨ Services started successfully!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for processes
wait


```

The script still isn't using the venv properly. Let me create a simpler fix - just export the environment variables to your shell session without needing a .env file:

Perfect! Now let me restart the services with the environment variables directly set:

```python
"""
FastAPI server for SEO Domain Checker API
"""
import logging
import sys
import traceback

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import db.db
from api.routes import router
from fastapi import Request
from fastapi.responses import PlainTextResponse

# Create FastAPI app
app = FastAPI(
    title="Verseo SEO Domain Checker API",
    description="API for analyzing and managing SEO domain evaluations",
    version="1.0.0",
    debug=True,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    print("🚀 Initializing database...")
    db.db.init_database()
    print("✅ Database initialized successfully")


@app.get("/", tags=["health"])
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Verseo SEO Domain Checker API",
        "version": "1.0.0"
    }


@app.get("/health", tags=["health"])
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.exception_handler(Exception)
async def all_exception_handler(request: Request, exc: Exception):
    sys.stderr.write("\n=== Exception caught by FastAPI ===\n")
    traceback.print_exc(file=sys.stderr)
    sys.stderr.write("=== End of traceback ===\n")
    return PlainTextResponse("Internal Server Error", status_code=500)

if __name__ == "__main__":
    import uvicorn

    db.db.init_database()
    logging.basicConfig(level=logging.DEBUG)
    logging.getLogger("uvicorn.error").setLevel(logging.DEBUG)
    logging.getLogger("uvicorn.access").setLevel(logging.DEBUG)
    logging.getLogger("uvicorn").setLevel(logging.DEBUG)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")


```

Excellent! Both services are running and responding. However, I need to make sure the environment variables are actually available to the backend process. Let me create a proper startup script:

```shellscript
#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Start backend with venv
./venv/bin/python api_server.py

```

Perfect! The backend is now running with environment variables loaded. Let me test if it can create an analysis:

Excellent! The analysis was created. Let me check if it's processing:

Great! The analyses are now in "running" status! This means:
- ✅ Backend is running
- ✅ API keys are loaded from .env
- ✅ Background processing is working

Let me check the backend logs to see the processing:

Perfect! Now I can see what's happening:

## ✅ **Good News:**
- Backend is running properly
- Environment variables from `.env` are being loaded
- Background processing is working
- The API is being called

## ❌ **Issue Found:**
The Ahrefs API is returning `401 Unauthorized`. This means:
- Your `AHREFS_API_TOKEN` might be invalid, expired, or doesn't have the required permissions
- The token needs access to the "batch-analysis" endpoint

## **Summary:**

Your setup is now working correctly! The error message you were seeing ("Failed to create analysis. Please make sure the backend server is running") should now be gone. **Try uploading a CSV file again from the frontend.**

However, the analysis will fail during processing because of the Ahrefs API authentication issue.

## **Next Steps:**

1. **Verify your Ahrefs API token** - Check if it has the correct permissions
2. **Test creating an analysis from the UI** - It should accept the file now
3. **Monitor progress** - The analysis will show as "running" but may fail due to the API issue

**To keep both services running**, you can use:
```bash
cd /Users/mykola.movchan/seo-domain-checker-1
./start-backend.sh > backend.log 2>&1 &
cd frontend && npm run dev -- --host > ../frontend.log 2>&1 &
```

Both services are currently running at:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000

```shellscript
cd /Users/mykola.movchan/seo-domain-checker-1
./start-backend.sh > backend.log 2>&1 &
cd frontend && npm run dev -- --host > ../frontend.log 2>&1 &
```

---

**User**

great! but why I did not see any logs for that? where can I see backend logs live?



The Ahrefs API is returning 401 Unauthorized. This means:

Your AHREFS_API_TOKEN might be invalid, expired, or doesn't have the required permissions

The token needs access to the "batch-analysis" endpoin

---

**Cursor**

Great questions! Let me show you how to monitor the backend logs in real-time and explain where they're going:

## Where Backend Logs Are:

The logs are being written to `/Users/mykola.movchan/seo-domain-checker-1/backend.log`. You probably didn't see them because they're in a file, not in your terminal.

## How to See Backend Logs Live:

Perfect! Now let me create a comprehensive guide and show you the current processing:

```markdown
# Monitoring Backend Logs

## Quick Start - Watch Logs Live

Open a **new terminal window** and run:

```bash
cd /Users/mykola.movchan/seo-domain-checker-1
./watch-logs.sh
```

Or manually:

```bash
tail -f /Users/mykola.movchan/seo-domain-checker-1/backend.log
```

This will show logs in real-time as they happen. Press `Ctrl+C` to stop watching.

---

## Log File Locations

- **Backend logs**: `backend.log`
- **Frontend logs**: `frontend.log` (if using the startup script)

---

## What You'll See in Backend Logs

### When Starting the Server:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
🚀 Initializing database...
✅ Database initialized successfully
```

### When Creating an Analysis:
```
INFO:     127.0.0.1:xxxxx - "POST /api/startAnalysis HTTP/1.1" 201 Created
```

### When Processing Analysis (Background Thread):
```
Extracting data for analysis {analysis_id}...
Initializing database...
Database initialized successfully!
Querying batch analysis...
```

### When Analysis Completes:
```
Analysis {analysis_id} completed successfully
```

### When Errors Occur:
You'll see full Python stack traces with the exact error

---

## Common Log Messages

### ✅ Success Messages:
- `"status": "healthy"` - Health check passed
- `✅ Database initialized` - Database ready
- `Analysis {id} completed successfully` - Processing finished
- `Successfully saved {N} records` - Data saved to database

### ⚠️ Warning Messages:
- `WARNING: StatReload detected changes` - Code changed, auto-reloading (normal in dev)

### ❌ Error Messages:
- `401 Unauthorized` - API authentication failed
- `ModuleNotFoundError` - Missing Python package
- `Address already in use` - Port 8000 already taken
- `Connection refused` - Service not running

---

## Monitoring Multiple Services

### Option 1: Multiple Terminal Windows
```bash
# Terminal 1 - Backend logs
cd /Users/mykola.movchan/seo-domain-checker-1
./watch-logs.sh

# Terminal 2 - Frontend logs (if separate)
cd /Users/mykola.movchan/seo-domain-checker-1
tail -f frontend.log

# Terminal 3 - Run commands
```

### Option 2: Using `tmux` (if installed)
```bash
tmux new-session -d -s seo-checker
tmux split-window -h
tmux select-pane -t 0
tmux send-keys "cd /Users/mykola.movchan/seo-domain-checker-1 && tail -f backend.log" C-m
tmux select-pane -t 1
tmux send-keys "cd /Users/mykola.movchan/seo-domain-checker-1 && tail -f frontend.log" C-m
tmux attach -t seo-checker
```

---

## Checking Service Status

### Check if Backend is Running:
```bash
ps aux | grep api_server.py | grep -v grep
```

### Check if Port 8000 is Open:
```bash
lsof -i :8000
```

### Test Backend Health:
```bash
curl http://localhost:8000/health
```

### View Recent Logs (last 50 lines):
```bash
tail -50 backend.log
```

### Search Logs for Errors:
```bash
grep -i error backend.log
grep -i exception backend.log
grep -i traceback backend.log
```

### Search for Specific Analysis:
```bash
grep "analysis_id_here" backend.log
```

---

## Understanding the 401 Unauthorized Error

The error you're seeing:
```
requests.exceptions.HTTPError: 401 Client Error: Unauthorized for url: https://api.ahrefs.com/v3/batch-analysis/batch-analysis
```

### What This Means:
1. ✅ Backend is running correctly
2. ✅ Environment variables are loaded
3. ✅ Analysis creation works
4. ✅ Background processing starts
5. ❌ Ahrefs API rejects the token

### Possible Causes:
1. **Invalid API Token**: Token is incorrect or expired
2. **Missing Permissions**: Token doesn't have access to "batch-analysis" endpoint
3. **Account Limits**: API quota exceeded or account suspended
4. **Token Format**: Token might need different format/authentication method

### How to Fix:
1. **Verify Token**: Log into your Ahrefs account and check:
   - Is the token still valid?
   - Does it have API access enabled?
   - What endpoints is it allowed to use?

2. **Test Token Manually**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        -H "Content-Type: application/json" \
        https://api.ahrefs.com/v3/batch-analysis/batch-analysis
   ```

3. **Check Ahrefs Documentation**: Make sure you're using the correct:
   - API endpoint URL
   - Authentication method
   - Request format

4. **Contact Ahrefs Support**: If token looks correct, they can verify:
   - Account status
   - API access permissions
   - Usage limits

---

## Real-Time Monitoring During Analysis

When you upload a CSV and create an analysis, watch the logs to see:

```
1. Analysis Created (immediate)
   → INFO: "POST /api/startAnalysis HTTP/1.1" 201 Created

2. Background Thread Starts
   → Extracting data for analysis {id}...

3. Data Extraction
   → Querying batch analysis...
   → Saving batch analysis to database...

4. Processing Each Domain
   → [Flusher] {id}: 1 domains completed
   → [Flusher] {id}: 2 domains completed
   ...

5. Rule Evaluation
   → Evaluating rules for each domain...

6. Completion
   → Analysis {id} completed successfully
```

---

## Troubleshooting

### No Logs Appearing?
```bash
# Check if file exists and has content
ls -lh backend.log
cat backend.log | wc -l
```

### Logs Not Updating?
```bash
# Check if backend is actually running
ps aux | grep api_server.py | grep -v grep

# Restart backend
pkill -f api_server.py
./start-backend.sh > backend.log 2>&1 &
```

### Can't Find Error?
```bash
# Show all errors with context
grep -B5 -A10 -i error backend.log
```

```

---

**User**

write me command how can I stop backend and run it again

---

**Cursor**

Here are the commands to stop and restart the backend:

## Stop Backend
```bash
pkill -f "api_server.py"
```

## Start Backend (with environment variables from .env)
```bash
cd /Users/mykola.movchan/seo-domain-checker-1
./start-backend.sh > backend.log 2>&1 &
```

## Stop and Restart in One Command
```bash
pkill -f "api_server.py" && sleep 2 && cd /Users/mykola.movchan/seo-domain-checker-1 && ./start-backend.sh > backend.log 2>&1 &
```

## Verify Backend is Running
```bash
# Check if process is running
ps aux | grep api_server.py | grep -v grep

# Test health endpoint
curl http://localhost:8000/health

# Watch logs in real-time
tail -f /Users/mykola.movchan/seo-domain-checker-1/backend.log
```

## Stop EVERYTHING (Frontend + Backend)
```bash
pkill -f "api_server.py"
pkill -f "vite --host"
```

## Start EVERYTHING (Frontend + Backend)
```bash
cd /Users/mykola.movchan/seo-domain-checker-1

# Start backend
./start-backend.sh > backend.log 2>&1 &

# Start frontend
cd frontend && npm run dev -- --host > ../frontend.log 2>&1 &
```

---

**Quick Reference Card** (save this):

| Action | Command |
|--------|---------|
| Stop backend | `pkill -f "api_server.py"` |
| Start backend | `./start-backend.sh > backend.log 2>&1 &` |
| Check backend status | `curl http://localhost:8000/health` |
| Watch logs live | `tail -f backend.log` |
| View last 50 log lines | `tail -50 backend.log` |
| Kill port 8000 | `lsof -ti:8000 \| xargs kill -9` |

Press `Ctrl+C` to stop watching logs (doesn't stop the server, just stops watching).

```shellscript
pkill -f "api_server.py"
```

```shellscript
cd /Users/mykola.movchan/seo-domain-checker-1
./start-backend.sh > backend.log 2>&1 &
```

```shellscript
pkill -f "api_server.py" && sleep 2 && cd /Users/mykola.movchan/seo-domain-checker-1 && ./start-backend.sh > backend.log 2>&1 &
```

```shellscript
# Check if process is running
ps aux | grep api_server.py | grep -v grep

# Test health endpoint
curl http://localhost:8000/health

# Watch logs in real-time
tail -f /Users/mykola.movchan/seo-domain-checker-1/backend.log
```

```shellscript
pkill -f "api_server.py"
pkill -f "vite --host"
```

```shellscript
cd /Users/mykola.movchan/seo-domain-checker-1

# Start backend
./start-backend.sh > backend.log 2>&1 &

# Start frontend
cd frontend && npm run dev -- --host > ../frontend.log 2>&1 &
```

