# Inventory Manager

Inventory workbench for Obsidian: manage **assets**, **people**, and **consumables** — track assignments, run audits, and export to CSV/XLSX via integrated Python scripts.

> ⚠️ **Desktop Only**: This plugin uses `node:child_process` to run Python scripts. It only works on Obsidian desktop apps.

## Features

### Asset Dashboard

- **Card Grid View**: Visual grid of all inventory items with status badges
- **Status Tracking**: 在库 (in-stock) / 在用 (in-use) / 借出 (borrowed) / 报废 (retired)
- **Category Filtering**: Filter by asset type or status
- **Anomaly Detection**: Auto-detect status contradictions (in-stock but has user) and low-stock warnings

### People Management

- **Employee Directory**: Track employees by department with 在职 (active) / 离职 (inactive) status
- **Assignment View**: See all assets assigned to a person
- **Device Return**: Check and process device returns when employees leave

### Consumables

- **Stock Tracking**: Track consumable quantities with low-stock alerts
- **Auto-Deduction**: Quantity automatically decrements on assignment

### Transaction Workflow

- **Create Asset**: Full form with category, serial number, vendor, warranty, price, location
- **Apply Assignment**: Assign assets to people with auto-generated transaction records
- **Device Return**: Return assets to stock with frontmatter update
- **Create Person**: Add new employees with department, position, contract entity

### Audit & Export

- **Audit System**: Run audit scripts to detect anomalies across the entire inventory
- **CSV/XLSX Export**: Export full inventory data for reporting

### Python Script Integration

All heavy operations are delegated to Python scripts in `Scripts/`:

| Script | Purpose |
|--------|---------|
| `next_inventory_id.py` | Generate next asset ID |
| `create_inventory_asset.py` | Create new asset file |
| `apply_inventory_transaction.py` | Apply assignment/return/transfer |
| `create_inventory_person.py` | Create person file |
| `audit_inventory.py` | Run anomaly detection |
| `export_inventory.py` | Export to CSV/XLSX |

## Screenshots

*(Add screenshots here: dashboard, asset card, transaction modal, people view)*

## Setup

1. Enable in **Settings → Community Plugins**
2. Open **Settings → Inventory Manager**
3. Configure:
   - **Inventory Root**: Default `库存/`
   - **Scripts Directory**: Default `Scripts`
   - **Python Command**: Default `python3`
   - **Default Operator**: Default assignee for transactions
4. Create the `Scripts/` directory with required Python scripts

## Requirements

- **Desktop only**: Uses `node:child_process` to run Python scripts
- **Python 3.10+**: Required for the inventory scripts
- **Scripts directory**: Must contain the scripts listed above

## Architecture

```
库存/
  设备/
    设备_<asset-id>_<title>.md
  人员/
    在职/
      <部门>_<姓名>.md
    离职/
      <部门>_<姓名>.md
  耗材/
    耗材_<category>_<title>.md
  记录/
    记录_<date>_<action>_<person>_<asset>.md
```

## Changelog

See `versions.json` for full version history.

## License

MIT
