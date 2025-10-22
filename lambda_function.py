import json
import boto3

# 🔧 明确区域（必须与 S3 一致）
s3 = boto3.client("s3", region_name="ap-northeast-1")
BUCKET = "ai-carecoach"

def lambda_handler(event, context):
    """
    ✅ 终极版 - AWS Function URL + S3 + JSON
    解决：Lambda 返回体为空 / fetch() 无响应
    """
    try:
        # 获取路径参数
        params = event.get("queryStringParameters") or {}
        path = params.get("path")

        if not path:
            return _response(400, {"error": "Missing path parameter"})

        print(f"📦 正在读取: s3://{BUCKET}/{path}")
        obj = s3.get_object(Bucket=BUCKET, Key=path)
        content = obj["Body"].read().decode("utf-8")

        # 解析 JSON
        try:
            data = json.loads(content)
            print("✅ JSON 文件解析成功")
        except Exception as e:
            print("⚠️ 文件不是 JSON:", e)
            data = {"raw": content[:300]}

        # ✅ 返回纯 JSON 字符串（Function URL 要求）
        body_str = json.dumps(data, ensure_ascii=False)
        print(f"📤 返回 body 长度: {len(body_str)}")

        return {
            "isBase64Encoded": False,  # 🔧 关键：防止空体
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate"
            },
            "body": body_str
        }

    except Exception as e:
        print("❌ 异常:", e)
        return _response(500, {"error": str(e)})


def _response(code, body_dict):
    """标准响应封装"""
    return {
        "isBase64Encoded": False,
        "statusCode": code,
        "headers": {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate"
        },
        "body": json.dumps(body_dict, ensure_ascii=False)
    }